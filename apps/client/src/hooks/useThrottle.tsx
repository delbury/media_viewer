import { useCallback, useRef } from 'react';

export const useThrottle = function <T extends unknown[], R>(cb: (...args: T) => R, timeout?: number) {
  const timer = useRef<number>(null);

  const callbackCache = useRef<() => void>(null);

  const wrappedCallback = useCallback(
    (...args: T) => {
      if (!timer.current) {
        // 当前无任务

        // 先执行，再节流
        cb(...args);
        timer.current = window.setTimeout(() => {
          timer.current = null;

          // 执行完成后检查是否有缓存的待执行任务
          callbackCache.current?.();
        }, timeout);
      } else {
        // 当前已有任务正在执行，或者还未执行

        // 将未调用的 callback 缓存起来
        // 确保最后一次 callback 能够执行
        callbackCache.current = () => {
          callbackCache.current = null;
          cb(...args);
          timer.current = window.setTimeout(() => {
            timer.current = null;
            callbackCache.current?.();
          }, timeout);
        };
      }
    },
    [cb, timeout]
  );

  return wrappedCallback;
};
