import path from 'node:path';

// 资源文件夹根目录
export const DIRECTORY_ROOTS = process.env.API_DIRECTORY_ROOT
  ? [process.env.API_DIRECTORY_ROOT]
  : null;

// 资源文件信息缓存文件路径
export const CACHE_DATA_PATH = path.resolve(__dirname, process.env.CACHE_DATA_PATH || './');

export const CACHE_DATE_FILE_NAME = 'full_dir_info.local.json';
