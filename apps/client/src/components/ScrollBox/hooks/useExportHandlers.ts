import { ForwardedRef, RefObject, useCallback, useImperativeHandle } from 'react';

export interface ScrollBoxInstance {
  scrollTo: (params: { top?: number; left?: number; behavior?: ScrollBehavior }) => void;
  scrollToEnd: () => void;
  getScrollPosition: () => { left: number; top: number } | null;
}

export const useExportHandlers = (
  ref: ForwardedRef<ScrollBoxInstance>,
  wrapperRef: RefObject<HTMLElement | null>
) => {
  // 滚动
  const scrollTo: ScrollBoxInstance['scrollTo'] = useCallback(
    ({ top, left, behavior }) => {
      wrapperRef.current?.scrollTo({
        top,
        left,
        behavior: behavior ?? 'smooth',
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
      getScrollPosition: () => {
        if (!wrapperRef.current) return null;
        const { scrollTop, scrollLeft } = wrapperRef.current;
        return {
          top: scrollTop,
          left: scrollLeft,
        };
      },
    }),
    [scrollTo, wrapperRef]
  );
};
