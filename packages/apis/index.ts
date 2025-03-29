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
} satisfies Record<string, ApiConfig>;

export type ApiKeys = keyof typeof API_CONFIGS;

export type ApiResponseType<T extends ApiKeys> = T extends 'dirUpdate'
  ? Pick<DirUpdateData, 'treeNode'>
  : T extends 'dirTree'
    ? DirectoryInfo
    : never;
