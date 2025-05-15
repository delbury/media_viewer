/**
 * query key
 */

import { FileInfo } from '#pkgs/apis';

// media modal 打开时，在 url 中标志的 query key
export const VIEWER_QUERY_KEY = 'viewer';

export enum ViewerQueryValue {
  None = '',
  Prev = 'prev',
  Current = 'current',
}

// file browser 中，打开对应的 dir 时标志的 query key
export const HASH_QUERY_KEY = 'hash';

// 文件信息的 id 字段
export const FILE_INFO_ID_FIELD: Extract<keyof FileInfo, 'showPath'> = 'showPath';
