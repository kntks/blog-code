import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

const baseURL = __ENV.BASE_URL || 'http://localhost';
const mode = __ENV.RATE_LIMIT_MODE || 'shared';
const limit = positiveInteger('RATE_LIMIT_MAX', 100);
const windowSeconds = positiveInteger('RATE_LIMIT_WINDOW_SECONDS', 60);
const totalRequests = positiveInteger('TOTAL_REQUESTS', 250);
const expectedInstances = positiveInteger('EXPECTED_INSTANCES', 2);

if (mode !== 'local' && mode !== 'shared') {
  throw new Error(`RATE_LIMIT_MODE must be local or shared, got ${mode}`);
}

const expectedAllowed = Math.min(
  totalRequests,
  mode === 'shared' ? limit : limit * expectedInstances,
);
const expectedRejected = totalRequests - expectedAllowed;

const allowedRequests = new Counter('allowed_requests');
const rejectedRequests = new Counter('rejected_requests');
const unexpectedResponses = new Counter('unexpected_responses');
const instanceRequests = new Counter('instance_requests');
const missingInstanceResponses = new Counter('missing_instance_responses');

http.setResponseCallback(http.expectedStatuses(200, 429));

export const options = {
  discardResponseBodies: true,
  scenarios: {
    fixed_window: {
      executor: 'shared-iterations',
      vus: 20,
      iterations: totalRequests,
      maxDuration: '30s',
    },
  },
  thresholds: {
    checks: ['rate==1'],
    allowed_requests: [`count==${expectedAllowed}`],
    rejected_requests: [`count==${expectedRejected}`],
    unexpected_responses: ['count==0'],
    instance_requests: [`count==${totalRequests}`],
    missing_instance_responses: ['count==0'],
  },
};

export function setup() {
  const secondsIntoWindow = Math.floor(Date.now() / 1000) % windowSeconds;
  const secondsRemaining = windowSeconds - secondsIntoWindow;

  // Avoid splitting the test across a Fixed Window boundary.
  if (secondsRemaining < 10) {
    sleep(secondsRemaining + 1);
  }

  return {
    apiKey: __ENV.API_KEY || `k6-${mode}-${Date.now()}`,
  };
}

export default function (data) {
  const response = http.get(`${baseURL}/`, {
    headers: {
      'X-API-Key': data.apiKey,
    },
    tags: {
      name: 'rate-limited endpoint',
    },
  });

  const allowed = response.status === 200;
  const rejected = response.status === 429;
  const instanceID = response.headers['X-Instance-Id'];

  allowedRequests.add(allowed ? 1 : 0);
  rejectedRequests.add(rejected ? 1 : 0);
  unexpectedResponses.add(allowed || rejected ? 0 : 1);
  instanceRequests.add(1, { instance: instanceID || 'missing' });
  missingInstanceResponses.add(instanceID ? 0 : 1);

  check(response, {
    'status is 200 or 429': () => allowed || rejected,
    'instance ID is present': () => Boolean(instanceID),
    '429 includes Retry-After': () => !rejected || Number(response.headers['Retry-After']) > 0,
  });
}

function positiveInteger(name, fallback) {
  const text = __ENV[name];
  if (!text) {
    return fallback;
  }

  const value = Number(text);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer, got ${text}`);
  }
  return value;
}
