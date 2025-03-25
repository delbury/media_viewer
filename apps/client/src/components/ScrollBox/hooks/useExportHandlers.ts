import { ForwardedRef, RefObject, useCallback, useImperativeHandle } from 'react';

export interface ScrollBoxInstance {
  scrollTo: (params: { top?: number; left?: number }) => void;
  scrollToEnd: () => void;
}

export const useExportHandlers = (ref: ForwardedRef<ScrollBoxInstance>, wrapperRef: RefObject<HTMLElement | null>) => {
  // 滚动
  const scrollTo: ScrollBoxInstance['scrollTo'] = useCallback(
    ({ top, left }) => {
      wrapperRef.current?.scrollTo({
        top,
        left,
        behavior: 'smooth',
      });
    },
    [wrapperRef]
  );

  // 暴露给父组件
  useImperativeHandle(
    ref,
    () => ({
      scrollTo,
      scrollToEnd: () => {
        scrollTo({ top: wrapperRef.current?.scrollHeight, left: wrapperRef.current?.scrollWidth });
      },
    }),
    [scrollTo, wrapperRef]
  );
};
