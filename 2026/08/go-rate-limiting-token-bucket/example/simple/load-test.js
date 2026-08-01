import http from 'k6/http';
import { check } from 'k6';
import { Counter } from 'k6/metrics';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';


export const options = {
  // discardResponseBodies: true,

  tags: {
    sample: 'simple-rate-limit',
  },

  thresholds: {
    checks: ['rate>0.99'],
    successCount: ['count>0'],
    rateLimitCount: ['count>0'],
  },

  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 10,              // 1秒あたり10リクエスト
      timeUnit: '1s',        // 時間単位
      duration: '9.9s',       // 10秒間実行
      preAllocatedVUs: 10,   // 事前に割り当てるVU（Virtual User）の数
      maxVUs: 20,            // 最大VU数
      gracefulStop: '1s',   // シナリオ終了時に進行中の処理を待つ時間
    },
  },
};

const successCount = new Counter('successCount');
const rateLimitCount = new Counter('rateLimitCount');

export default function() {
  const id = Math.floor(Math.random() * 100) + 1;
  const url = `http://localhost:8080/api/items/${id}`;
  
  const response = http.get(url);
  
  if (response.status === 200) successCount.add(1);
  if (response.status === 429) rateLimitCount.add(1);
  
  check(response, {
    'status is 200 or 429': (r) => r.status === 200 || r.status === 429,
  });
}

// テスト終了時の処理
export function handleSummary(data) {

  for (const key in data.metrics) {
    if (key.startsWith('successCount') || key.startsWith('rateLimitCount') || key.startsWith('vus')) continue;
    delete data.metrics[key];
  }
  return {
    'stdout': textSummary(data)
  }
}
