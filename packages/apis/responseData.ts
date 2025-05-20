/**
 * 接口返回数据类型
 */

import { MediaDetailInfo } from '../shared';
import { DirectoryInfo, DirUpdateData, FileInfo } from './common';
import { ApiKeys } from './config';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ApiResponseDataTypeMapObj = {
  dirUpdate: {} as Omit<DirUpdateData, 'fileList'>,
  dirTree: {} as DirectoryInfo,
  fileText: {} as FileTextResponseData,
  videoSubtitle: {} as FileTextResponseData,
  videoMetadata: {} as VideoMetadataResponseData,
  mediaMetadata: {} as MediaDetailInfo,
  mediaDislikeSet: {} as MediaDislikeResponseData,
  mediaDislikeGet: {} as MediaDislikeResponseData,
  mediaDislikeList: {} as MediaDislikeListResponseData,
} satisfies Partial<Record<ApiKeys, unknown>>;

type ApiResponseDataTypeMap = typeof ApiResponseDataTypeMapObj;

export type ApiResponseDataTypes<T extends ApiKeys> = T extends keyof ApiResponseDataTypeMap
  ? ApiResponseDataTypeMap[T]
  : never;

// 文件文件直接返回文本数据
interface FileTextResponseData {
  content: string;
}

// 视频文件的 metadata 信息
interface VideoMetadataResponseData {
  duration: number;
  size: number;
  bitRate: number;
}

// 媒体文件标记为不喜欢
interface MediaDislikeResponseData {
  dislike: boolean;
}

// 不喜欢媒体的列表
interface MediaDislikeListResponseData {
  list: FileInfo[];
}

/**
 * 基础接口返回类型
 */
export interface ApiResponseBase<T = unknown> {
  msg?: string;
  code: number;
  data?: T;
}
