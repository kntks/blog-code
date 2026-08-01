import http from 'k6/http';
import { check } from 'k6';
import exec from 'k6/execution';
import { Counter } from 'k6/metrics';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';

const users = ['alice', 'bob'];
const userMetrics = {
  alice: {
    success: new Counter('alice_success_count'),
    rateLimited: new Counter('alice_rate_limit_count'),
  },
  bob: {
    success: new Counter('bob_success_count'),
    rateLimited: new Counter('bob_rate_limit_count'),
  },
};

export const options = {
  discardResponseBodies: true,

  tags: {
    sample: 'per-user-rate-limit',
  },

  thresholds: {
    checks: ['rate>0.99'],
    alice_success_count: ['count>0'],
    alice_rate_limit_count: ['count>0'],
    bob_success_count: ['count>0'],
    bob_rate_limit_count: ['count>0'],
  },

  scenarios: {
    per_user_rate_limit: {
      executor: 'constant-arrival-rate',
      rate: 10,
      timeUnit: '1s',
      duration: '5.9s',
      preAllocatedVUs: 4,
      maxVUs: 8,
      gracefulStop: '1s',
    },
  },
};


export default function () {
  // 各ユーザーへ同程度のリクエストを送る。
  const iteration = exec.scenario.iterationInTest;
  const userID = users[iteration % users.length];
  const itemID = (iteration % 100) + 1;
  const response = http.get(`http://localhost:8080/api/items/${itemID}`, {
    headers: {
      'X-User-ID': userID,
    },
  });

  const isSuccess = response.status === 200;
  const isRateLimited = response.status === 429;
  if (isSuccess) userMetrics[userID].success.add(1);
  if (isRateLimited) userMetrics[userID].rateLimited.add(1);

  check(response, {
    [`${userID}: status is 200 or 429`]: (r) =>
      r.status === 200 || r.status === 429,
  });
}

export function handleSummary(data) {
  const summaryMetricNames = [
    'alice_rate_limit_count',
    'alice_success_count',
    'bob_rate_limit_count',
    'bob_success_count',
    'checks',
  ];
  const summaryData = {
    ...data,
    metrics: Object.fromEntries(
      summaryMetricNames
        .filter((name) => data.metrics[name])
        .map((name) => [name, data.metrics[name]]),
    ),
  };

  return {
    stdout: textSummary(summaryData),
  };
}
