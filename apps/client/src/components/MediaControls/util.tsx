import { SxProps, Theme } from '@mui/material';

// 绑定事件
export const bindEvent = <T extends keyof HTMLMediaElementEventMap>(
  elm: HTMLMediaElement,
  eventName: T,
  cb: (ev: HTMLMediaElementEventMap[T]) => void
) => {
  const controller = new AbortController();
  elm.addEventListener(eventName, cb, { signal: controller.signal });
  return controller;
};

// 只执行一次的事件
export const bindEventOnce = <T extends keyof HTMLMediaElementEventMap>(
  elm: HTMLMediaElement,
  eventName: T,
  cb: (ev: HTMLMediaElementEventMap[T]) => void
) => {
  elm.addEventListener(eventName, cb, { once: true });
};

// 在 video 上拖动时，每像素的偏移时间
export const PROGRESS_DRAG_PER_PX = 0.1;
// 判断在 video 上拖拽的方向时的最小距离的平方
export const DRAG_DIR_MIN_DISTANCE = 5 ** 2;

// 取消区域的样式
export const CANCEL_AREA_SX: SxProps<Theme> = {
  marginTop: '72px',
};
