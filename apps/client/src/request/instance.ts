import { API_CONFIGS, ApiKeys, ApiRequestDataTypes, ApiRequestParamsTypes } from '#pkgs/apis';
import { REQUEST_TIMEOUT } from '#pkgs/tools/constant';
import axios from 'axios';

export const API_BASE_URL = '/api';

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
});

// instance.interceptors.request.use();
// instance.interceptors.response.use();

interface FetchDataOptions<T extends ApiKeys> {
  params?: ApiRequestParamsTypes<T>;
  data?: ApiRequestDataTypes<T>;
  signal?: AbortSignal;
}

const fetchData = async <T extends ApiKeys>(
  apiKey: T,
  { params, data, signal }: FetchDataOptions<T> = {}
) => {
  const body = data ? JSON.stringify(data) : void 0;
  const search = params
    ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
    : '';

  const response = await fetch(`${API_BASE_URL}${API_CONFIGS[apiKey].url}${search}`, {
    method: API_CONFIGS[apiKey].method,
    body,
    headers: {
      'Content-Type': 'application/json',
    },
    signal,
  });

  return response;
};

export { fetchData, instance };
