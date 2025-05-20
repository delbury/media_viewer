/**
 * 接口请求参数类型，body 上的参数
 */

import { ApiKeys } from './config';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ApiResponseDataTypeMapObj = {
  posterClear: {} as ApiFilePosterClearParams,
  fileDelete: {} as ApiFileDeleteParams,
  mediaDislikeSet: {} as ApiMediaDislikeSetParams,
} satisfies Partial<Record<ApiKeys, unknown>>;

type ApiResponseDataTypeMap = typeof ApiResponseDataTypeMapObj;

export type ApiRequestDataTypes<T extends ApiKeys> = T extends keyof ApiResponseDataTypeMap
  ? ApiResponseDataTypeMap[T]
  : never;

interface ApiFilePosterClearParams {
  clearAll?: boolean;
}

interface ApiFileDeleteParams {
  files: {
    basePathIndex: number;
    relativePath: string;
  }[];
}

interface ApiMediaDislikeSetParams {
  basePathIndex: number;
  relativePath: string;
  dislike?: boolean;
}
