// media viewer 的层级
export const FIXED_MODAL_Z_INDEX = 1400;

// cancel area 区域的层级
export const CANCEL_MODAL_Z_INDEX = 1500;

// notifications 的层级
export const NOTIFICATION_Z_INDEX = 4000;

// 在 media viewer 内的 dialog 层级
export const DIALOG_IN_FIXED_MODAL_Z_INDEX = 1450;

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
