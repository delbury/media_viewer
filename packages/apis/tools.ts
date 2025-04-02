import { API_CONFIGS, ApiKeys, ApiRequestParamsTypes } from '.';

// 获取带参数的url，用于直接使用 url 的场景，如图片的 src
export const joinUrlWithQueryString = <T extends ApiKeys>(
  apiKey: T,
  query: ApiRequestParamsTypes<T>,
  baseUrl?: string
) => {
  const stringifiedQueryObj = Object.fromEntries(
    Object.entries(query).map(([key, value]) => [key, `${value}`] as const)
  );
  const queryString = new URLSearchParams(stringifiedQueryObj).toString().replace(/\+/g, '%20');
  return `${baseUrl ?? ''}${API_CONFIGS[apiKey].url}?${queryString}`;
};
