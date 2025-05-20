/**
 * 接口请求参数类型，query 上的参数
 */

import { ParsedUrlQuery } from 'querystring';
import { ApiKeys } from './config';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ApiRequestParamsTypeMapObj = {
  posterGet: {} as ApiPosterGetParams,
  fileGet: {} as ApiFileFetchParams,
  fileText: {} as ApiFileFetchParams,
  videoFallback: {} as ApiFileFetchParams,
  videoMetadata: {} as ApiFileFetchParams,
  mediaMetadata: {} as ApiFileFetchParams,
  videoSubtitle: {} as ApiFileFetchParams,
  videoSegment: {} as ApiVideoSegment,
  mediaDislikeGet: {} as ApiMediaDislikeGetParams,
} satisfies Partial<Record<ApiKeys, unknown>>;

type ApiRequestParamsTypeMap = typeof ApiRequestParamsTypeMapObj;

export type ApiRequestParamsTypes<T extends ApiKeys> = T extends keyof ApiRequestParamsTypeMap
  ? ApiRequestParamsTypeMap[T]
  : never;

type ApiRequestParamsBase = ParsedUrlQuery;

interface ApiFileFetchParams extends ApiRequestParamsBase {
  basePathIndex: string;
  relativePath: string;
}

// 获取缩略图的请求参数
interface ApiPosterGetParams extends ApiFileFetchParams {
  force?: 'true';
}

// 请求 fmp4 分片的请求参数
interface ApiVideoSegment extends ApiFileFetchParams {
  // 数字字符串
  start: string;
  // 数字字符串
  duration: string;
}

interface ApiMediaDislikeGetParams extends ParsedUrlQuery {
  basePathIndex: string;
  relativePath: string;
}
