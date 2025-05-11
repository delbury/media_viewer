// 绑定事件
export const bindEvent = <T extends keyof HTMLMediaElementEventMap>(
  elm: HTMLMediaElement,
  eventName: T,
  cb: (ev: HTMLMediaElementEventMap[T]) => void,
  options?: AddEventListenerOptions
) => {
  const controller = new AbortController();
  elm.addEventListener(eventName, cb, { ...options, signal: controller.signal });
  return controller;
};

// 只执行一次的事件
export const bindEventOnce = <T extends keyof HTMLMediaElementEventMap>(
  elm: HTMLMediaElement,
  eventName: T,
  cb: (ev: HTMLMediaElementEventMap[T]) => void,
  options?: AddEventListenerOptions
) => {
  elm.addEventListener(eventName, cb, { ...options, once: true });
};
