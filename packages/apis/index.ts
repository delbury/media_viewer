import { ParsedUrlQuery } from 'querystring';
import { DirectoryInfo, DirUpdateData } from '../shared';

export * from './tools';

export type Method =
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

/**
 * 所有接口配置
 */
export const API_CONFIGS = {
  // 更新目录树
  dirUpdate: {
    url: '/dir/update',
    method: 'post',
  },
  // 获取目录树
  dirTree: {
    url: '/dir/tree',
    method: 'get',
  },
  // 获取缩略图
  filePoster: {
    url: '/file/poster',
    method: 'get',
  },
  // 清除缩略图
  filePosterClear: {
    url: '/file/poster/clear',
    method: 'post',
  },
} satisfies Record<string, ApiConfig>;

export type ApiKeys = keyof typeof API_CONFIGS;

/**
 * 接口返回数据类型
 */
export type ApiResponseDataTypes<T extends ApiKeys> = T extends 'dirUpdate'
  ? Omit<DirUpdateData, 'fileList'>
  : T extends 'dirTree'
    ? DirectoryInfo
    : never;

/**
 * 接口请求参数类型，query 上的参数
 */
export type ApiRequestParamsTypes<T extends ApiKeys> = T extends 'filePoster'
  ? ApiFilePosterParams
  : T extends 'filePosterClear'
    ? ApiFilePosterClearParams
    : never;

type ApiRequestParamsBase = ParsedUrlQuery;
interface ApiFilePosterParams extends ApiRequestParamsBase {
  basePathIndex: string;
  relativePath: string;
  force?: 'true';
}

/**
 * 接口请求参数类型，body 上的参数
 */

export type ApiRequestDataTypes<T extends ApiKeys> = T extends 'filePosterClear'
  ? ApiFilePosterClearParams
  : never;

interface ApiFilePosterClearParams {
  clearAll?: boolean;
}
