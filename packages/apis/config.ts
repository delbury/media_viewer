import { ApiConfig } from './common';

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
  // 删除文件
  fileDelete: {
    url: '/file/delete',
    method: 'post',
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
  videoFallback: {
    url: '/video/fallback',
    method: 'get',
  },
  // 获取视频文件的 metadata 信息
  videoMetadata: {
    url: '/video/metadata',
    method: 'get',
  },
  // 获取视频文件的转换成 fmp4 的分片
  videoSegment: {
    url: '/video/segment',
    method: 'get',
  },
  // 获取视频的字幕文件
  videoSubtitle: {
    url: '/video/subtitle',
    method: 'get',
  },
  // 获取媒体文件的 metadata 信息
  mediaMetadata: {
    url: '/media/metadata',
    method: 'get',
  },
  mediaDislikeSet: {
    url: '/media/dislike/set',
    method: 'post',
  },
  mediaDislikeGet: {
    url: '/media/dislike/get',
    method: 'get',
  },
  mediaDislikeList: {
    url: '/media/dislike/list',
    method: 'get',
  },
  mediaDislikeClear: {
    url: '/media/dislike/clear',
    method: 'post',
  },
} satisfies Record<string, ApiConfig>;

export type ApiKeys = keyof typeof API_CONFIGS;
