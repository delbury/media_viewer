import { IGNORE_FILE_NAME_PREFIX } from '#pkgs/tools/constant';
import packageJson from '#root/package.json';
import path from 'node:path';
import { generateHash } from '../util/common';

// 自定义 header
export const CUSTOM_REQUEST_HEADER = 'X-Custom-Request-Id';

// server 版本
export const SERVER_VERSION = process.env.SERVER_VERSION || packageJson.version || void 0;

// 资源文件夹根目录
export const DIRECTORY_ROOTS = process.env.API_DIRECTORY_ROOT?.split(',') ?? null;

// 资源文件信息缓存文件路径
export const CACHE_DATA_PATH = path.resolve(__dirname, process.env.CACHE_DATA_PATH || './');

// 资源文件信息缓存文件完整路径
export const CACHE_DATE_FILE_NAME = `${generateHash(DIRECTORY_ROOTS?.join('/') ?? '')}.local.info`;
export const CACHE_DATE_FILE_FULL_PATH = path.join(CACHE_DATA_PATH, CACHE_DATE_FILE_NAME);

// 视频文件时长信息的缓存路径
export const CACHE_DATA_VIDEO_DURATION_NAME = `${generateHash(DIRECTORY_ROOTS?.join('/') ?? '')}_duration.local.info`;
export const CACHE_DATA_VIDEO_DURATION_FULL_PATH = path.join(
  CACHE_DATA_PATH,
  CACHE_DATA_VIDEO_DURATION_NAME
);

// dislike 文件列表缓存路径
export const CACHE_DATA_DISLIKE_MEDIA_FILE_NAME = `${generateHash(DIRECTORY_ROOTS?.join('/') ?? '')}_dislike.local.info`;
export const CACHE_DATA_DISLIKE_MEDIA_FILE_FULL_PATH = path.join(
  CACHE_DATA_PATH,
  CACHE_DATA_DISLIKE_MEDIA_FILE_NAME
);

// 原始图片可以直接用于 poster 的最大大小，单位：字节 B
export const RAW_IMAGE_FOR_POSTER_MAX_SIZE = 1024 * 512;

// 缩略图浏览器缓存时间
export const POSTER_CACHE_MAX_AGE = 1000 * 60 * 10;
// 缩略图封面文件名前缀
export const POSTER_FILE_NAME_PREFIX = `${IGNORE_FILE_NAME_PREFIX}poster__`;
// 生成的缩略图文件名扩展名
export const POSTER_FILE_EXT = '.webp';
// 缩略图长或宽最大尺寸
export const POSTER_MAX_SIZE = 640;
// 保存缩略图的文件夹名
export const POSTER_DIR_NAME = `${IGNORE_FILE_NAME_PREFIX}poster_dir`;

// 返回文本文件的大小限制，单位：字节 B
export const TEXT_FILE_SIZE_LIMIT = 1024 * 1024 * 0.5;

// 视频转码的最大分辨率尺寸
export const VIDEO_TRANSFORM_MAX_WIDTH = 1920;
export const VIDEO_TRANSFORM_MAX_HEIGHT = 1080;
