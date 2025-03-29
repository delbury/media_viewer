import path from 'node:path';

export const DIRECTORY_ROOTS = process.env.API_DIRECTORY_ROOT
  ? [process.env.API_DIRECTORY_ROOT]
  : null;
export const CACHE_DATA_PATH = path.resolve(__dirname, process.env.CACHE_DATA_PATH || './');
