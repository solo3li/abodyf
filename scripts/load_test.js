import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100, // Reduced from 1000 for local safety, can be scaled in production
  duration: '30s',
};

const BASE_URL = 'http://localhost:5000/api';

export default function () {
  // 1. Get Services
  let res = http.get(`${BASE_URL}/Services`);
  check(res, { 'status is 200': (r) => r.status === 200 });

  // 2. Get Categories
  res = http.get(`${BASE_URL}/Categories`);
  check(res, { 'status is 200': (r) => r.status === 200 });

  // 3. Simulating auth check (public endpoints for now since we don't have a login loop here)
  // In a real test, we would log in and use the token
  
  sleep(1);
}
