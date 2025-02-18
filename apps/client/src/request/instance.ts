import axios from 'axios';

const instance = axios.create({
  baseURL: '/api',
  timeout: 6000,
});

// instance.interceptors.request.use();
// instance.interceptors.response.use();

export { instance };
