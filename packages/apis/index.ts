import { ParsedUrlQuery } from 'querystring';
import {
  DirectoryInfo,
  FileInfo,
  TraverseDirectoriesReturnValue,
} from '../tools/traverseDirectories';

export * from './tools';

type DirUpdateData = TraverseDirectoriesReturnValue;

export type { DirectoryInfo, DirUpdateData, FileInfo };

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
  // 获取文件
  fileGet: {
    url: '/file/get',
    method: 'get',
  },
  // 获取文本文件的内容
  fileText: {
    url: '/file/text',
    method: 'get',
  },
  // 获取缩略图
  posterGet: {
    url: '/poster/get',
    method: 'get',
  },
  // 清除缩略图
  posterClear: {
    url: '/poster/clear',
    method: 'post',
  },
  // 获取视频文件的 fallback url
  fileVideoFallback: {
    url: '/file/video/fallback',
    method: 'get',
  },
  // 获取视频文件的 metadata 信息
  fileVideoMetadata: {
    url: '/file/video/metadata',
    method: 'get',
  },
  // 获取视频文件的转换成 fmp4 的分片
  fileVideoSegment: {
    url: '/file/video/segment',
    method: 'get',
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
    : T extends 'fileText'
      ? FileTextResponseData
      : T extends 'fileVideoMetadata'
        ? FileVideoMetadataResponseData
        : never;

// 文件文件直接返回文本数据
interface FileTextResponseData {
  content: string;
}
// 视频文件的 metadata 信息
interface FileVideoMetadataResponseData {
  duration: number;
  size: number;
  bitRate: number;
}

/**
 * 接口请求参数类型，query 上的参数
 */
export type ApiRequestParamsTypes<T extends ApiKeys> = T extends 'posterGet'
  ? ApiFilePosterParams
  : T extends 'fileGet' | 'fileText' | 'fileVideoFallback' | 'fileVideoMetadata'
    ? ApiFileFetchParams
    : T extends 'fileVideoSegment'
      ? ApiFileVideoSegment
      : never;

type ApiRequestParamsBase = ParsedUrlQuery;
interface ApiFileFetchParams extends ApiRequestParamsBase {
  basePathIndex: string;
  relativePath: string;
}
// 获取缩略图的请求参数
interface ApiFilePosterParams extends ApiFileFetchParams {
  force?: 'true';
}
// 请求 fmp4 分片的请求参数
interface ApiFileVideoSegment extends ApiFileFetchParams {
  // 数字字符串
  start: string;
  // 数字字符串
  duration: string;
}

/**
 * 接口请求参数类型，body 上的参数
 */

export type ApiRequestDataTypes<T extends ApiKeys> = T extends 'posterClear'
  ? ApiFilePosterClearParams
  : never;

interface ApiFilePosterClearParams {
  clearAll?: boolean;
}

/**
 * 基础接口返回类型
 */
export interface ApiResponseBase<T = unknown> {
  msg?: string;
  code: number;
  data?: T;
}
