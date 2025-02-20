import axios from 'axios';

export const TIMEOUT = 1000 * 60;
const instance = axios.create({
  baseURL: '/api',
  timeout: TIMEOUT,
});

// instance.interceptors.request.use();
// instance.interceptors.response.use();

export { instance };
