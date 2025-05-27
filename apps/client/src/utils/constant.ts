/**
 * query key
 */

// media modal 打开时，在 url 中标志的 query key
export const VIEWER_QUERY_KEY = 'viewer';

export enum ViewerQueryValue {
  None = '',
  Prev = 'prev',
  Current = 'current',
}

// file browser 中，打开对应的 dir 时标志的 query key
export const HASH_QUERY_KEY = 'hash';

// 倍数符号
export const MULTIPLE_SYMBOL = 'x';

// 空的占位符
export const EMPTY_SYMBOL = '-';
