import { useCallback, useRef } from 'react';

type Timeout = number;
interface NormalOptions {
  timeout?: number;
  // 不缓存最后一次回调
  notCacheLastCall?: boolean;
}

interface AnimationFrameOptions {
  byAnimationFrame: boolean;
  // 不缓存最后一次回调
  notCacheLastCall?: boolean;
}

export const useThrottle = <T extends unknown[], R>(
  cb?: (...args: T) => R,
  opt?: Timeout | NormalOptions | AnimationFrameOptions
) => {
  const timeout = typeof opt === 'number' ? opt : opt && 'timeout' in opt ? opt.timeout : void 0;
  const notCacheLastCall = typeof opt === 'object' && !!opt.notCacheLastCall;
  const byAnimationFrame =
    typeof opt === 'object' && 'byAnimationFrame' in opt ? opt.byAnimationFrame : false;

  const timer = useRef<number>(null);
  const callbackCache = useRef<() => void>(null);

  const wrappedCallback = useCallback(
    (...args: T) => {
      if (!timer.current) {
        // 当前无任务

        // 先执行，再节流
        cb?.(...args);
        if (byAnimationFrame) {
          timer.current = window.requestAnimationFrame(() => {
            timer.current = null;

            // 执行完成后检查是否有缓存的待执行任务
            callbackCache.current?.();
          });
        } else {
          timer.current = window.setTimeout(() => {
            timer.current = null;

            // 执行完成后检查是否有缓存的待执行任务
            callbackCache.current?.();
          }, timeout);
        }
      } else if (!notCacheLastCall) {
        // 当前已有任务正在执行，或者还未执行

        // 将未调用的 callback 缓存起来
        // 确保最后一次 callback 能够执行
        callbackCache.current = () => {
          callbackCache.current = null;
          cb?.(...args);

          if (byAnimationFrame) {
            timer.current = window.requestAnimationFrame(() => {
              timer.current = null;
              callbackCache.current?.();
            });
          } else {
            timer.current = window.setTimeout(() => {
              timer.current = null;
              callbackCache.current?.();
            }, timeout);
          }
        };
      }
    },
    [byAnimationFrame, cb, notCacheLastCall, timeout]
  );

  return wrappedCallback;
};
