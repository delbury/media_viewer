import { useCallback, useRef } from 'react';

type CustomCallback = (diffTime: number) => void;
interface Options {
  // 当间隔时间小于此值时跳过，单位：ms
  minGapTime?: number;
}

export const useAnimationFrame = (cb: CustomCallback, { minGapTime }: Options = {}) => {
  const requestId = useRef<number>(null);
  const prevTime = useRef<number>(null);

  const callback = useCallback(() => {
    requestId.current = window.requestAnimationFrame(time => {
      if (prevTime.current) {
        const diffTime = time - prevTime.current;

        if (minGapTime && diffTime < minGapTime) {
          // 跳过
          callback();
          return;
        }

        cb(diffTime);
      }
      prevTime.current = time;
      callback();
    });
  }, [cb, minGapTime]);

  const start = useCallback((delay?: number) => setTimeout(callback, delay), [callback]);

  const stop = useCallback(() => {
    if (requestId.current) window.cancelAnimationFrame(requestId.current);
    requestId.current = null;
  }, []);

  return {
    start,
    stop,
  };
};
