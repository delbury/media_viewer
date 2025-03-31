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
export const RAW_IMAGE_FOR_POSTER_MAX_SIZE = 1024 * 1024;
