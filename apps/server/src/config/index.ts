import { IGNORE_FILE_NAME_PREFIX } from '#pkgs/tools/constant.js';
import packageJson from '#root/package.json';
import path from 'node:path';

// server 版本
export const SERVER_VERSION = process.env.SERVER_VERSION || packageJson.version || null;

// 资源文件夹根目录
export const DIRECTORY_ROOTS = process.env.API_DIRECTORY_ROOT
  ? [process.env.API_DIRECTORY_ROOT]
  : null;

// 资源文件信息缓存文件路径
export const CACHE_DATA_PATH = path.resolve(__dirname, process.env.CACHE_DATA_PATH || './');
// 资源文件信息缓存文件名
export const CACHE_DATE_FILE_NAME = 'full_dir_info.local.json';

// 原始图片可以直接用于 poster 的最大大小，单位：字节 B
export const RAW_IMAGE_FOR_POSTER_MAX_SIZE = 1024 * 512;

// 缩略图浏览器缓存时间
export const POSTER_CACHE_MAX_AGE = 1000 * 60 * 10;
// 缩略图封面文件名前缀
export const POSTER_FILE_NAME_PREFIX = `${IGNORE_FILE_NAME_PREFIX}poster__`;
// 生成的缩略图文件名扩展名
export const POSTER_FILE_EXT = '.jpg';
// 缩略图长或宽最大尺寸
export const POSTER_MAX_SIZE = 400;
// 保存缩略图的文件夹名
export const POSTER_DIR_NAME = `${IGNORE_FILE_NAME_PREFIX}poster_dir`;

// 长视频时长阈值，超过则为长视频，单位：秒
export const LONG_VIDEO_DURATION_THRESHOLD = 30;
// 短视频，封面帧的时间位置
export const SHORT_VIDEO_POSTER_FRAME_TIME = 0;
// 长视频，封面帧的时间位置
export const LONG_VIDEO_POSTER_FRAME_TIME = 5;

// 返回文本文件的大小限制，单位：字节 B
export const TEXT_FILE_SIZE_LIMIT = 1024 * 1024 * 0.5;
