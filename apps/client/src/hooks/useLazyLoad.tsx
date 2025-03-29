import { useCallback, useEffect, useRef } from 'react';

export type LazyLoadObserve = (el: HTMLElement | null, cb: () => void) => (() => void) | void;

export const useLazyLoad = ({
  enabled,
  root,
}: {
  root?: HTMLElement | null;
  enabled?: boolean;
} = {}) => {
  const observer = useRef<IntersectionObserver>(null);
  const callbackMap = useRef<WeakMap<Element, () => void>>(new WeakMap());

  const resetObserver = useCallback(() => {
    observer.current?.disconnect();
    observer.current = null;
  }, []);

  // 开始监听
  const observe = useCallback<LazyLoadObserve>(
    (elm, cb) => {
      if (!enabled || !elm) return;
      observer.current?.observe(elm);
      callbackMap.current.set(elm, cb);
      return () => {
        observer.current?.unobserve(elm);
        callbackMap.current.delete(elm);
      };
    },
    [enabled]
  );

  useEffect(() => {
    if (!enabled) return;
    resetObserver();
    // 创建新的观察
    observer.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // 触发回调
            callbackMap.current.get(entry.target)?.();
            callbackMap.current.delete(entry.target);
            // 移除已处理的元素
            observer.current?.unobserve(entry.target);
          }
        });
      },
      {
        root,
      }
    );

    return () => {
      resetObserver();
    };
  }, [enabled, root]);

  return {
    observer,
    observe,
  };
};
