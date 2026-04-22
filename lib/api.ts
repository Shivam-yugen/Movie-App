import axios from 'axios';
import { config } from './config';
import { getToken } from './storage';

export const api = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 15000,
});

api.interceptors.request.use(async (req) => {
  const token = await getToken();
  if (token) {
    req.headers = req.headers ?? {};
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export async function healthCheck() {
  // Uses fetch (not axios) to demonstrate both.
  const res = await fetch(`${config.apiBaseUrl}/health`);
  if (!res.ok) throw new Error('health_failed');
  return res.json();
}

