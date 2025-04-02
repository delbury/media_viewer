import { useCallback, useRef } from 'react';
import { useThrottle } from './useThrottle';

export const useIdleCallback = <T extends unknown[], R>(
  cb: (...args: T) => R,
  timeout?: number
) => {
  const cbId = useRef<number>(null);

  const idleCallback = useCallback(
    (...args: T) => {
      // 性能优化
      if (cbId.current) {
        window.cancelIdleCallback(cbId.current);
      }
      cbId.current = window.requestIdleCallback(async () => {
        cb(...args);
        cbId.current = null;
      });
    },
    [cb]
  );

  const throttledCallback = useThrottle(idleCallback, timeout);

  return timeout ? throttledCallback : idleCallback;
};
