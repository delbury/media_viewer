import { DirectoryInfo, DirUpdateData } from '../shared';

type Method =
  | 'link'
  | 'head'
  | 'get'
  | 'delete'
  | 'options'
  | 'post'
  | 'put'
  | 'patch'
  | 'purge'
  | 'unlink';

export interface ApiConfig {
  url: string;
  method: Method;
}

export const API_CONFIGS = {
  dirUpdate: {
    url: '/dir/update',
    method: 'get',
  },
  dirTree: {
    url: '/dir/tree',
    method: 'get',
  },
  filePoster: {
    url: '/file/poster',
    method: 'get',
  },
} satisfies Record<string, ApiConfig>;

export type ApiKeys = keyof typeof API_CONFIGS;

// 接口返回数据类型
export type ApiResponseDataTypes<T extends ApiKeys> = T extends 'dirUpdate'
  ? Pick<DirUpdateData, 'treeNode'>
  : T extends 'dirTree'
    ? DirectoryInfo
    : never;

type ApiParamsBase = Record<string, unknown>;
interface ApiFilePosterParams extends ApiParamsBase {
  basePathIndex: number;
  relativePath: string;
}
// 接口请求参数类型
export type ApiRequestParamsTypes<T extends ApiKeys> = T extends 'filePoster'
  ? ApiFilePosterParams
  : never;

// 获取带参数的url，用于直接使用 url 的场景，如图片的 src
export const joinUrlWithQueryString = function <T extends ApiKeys>(
  apiKey: T,
  query: ApiRequestParamsTypes<T>,
  baseUrl?: string
) {
  const stringifiedQueryObj = Object.fromEntries(
    Object.entries(query).map(([key, value]) => [key, `${value}`] as const)
  );
  const queryString = new URLSearchParams(stringifiedQueryObj).toString().replace(/\+/g, '%20');
  return `${baseUrl ?? ''}${API_CONFIGS[apiKey].url}?${queryString}`;
};
