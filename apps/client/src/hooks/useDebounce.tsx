import { useCallback, useRef } from 'react';

// 去抖，执行最后一次
export const useDebounce = <T extends unknown[], R>(cb?: (...args: T) => R, timeout?: number) => {
  const timer = useRef<number>(null);

  const wrappedCallback = useCallback(
    (...args: T) => {
      if (timer.current) {
        window.clearTimeout(timer.current);
        timer.current = null;
      }
      timer.current = window.setTimeout(() => {
        cb?.(...args);
        timer.current = null;
      }, timeout);
    },
    [cb, timeout]
  );

  return wrappedCallback;
};
