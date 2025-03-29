import axios from 'axios';

export const TIMEOUT = 1000 * 60;

export const API_BASE_URL = '/api';

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT,
});

// instance.interceptors.request.use();
// instance.interceptors.response.use();

export { instance };
