import { RefObject, useEffect, useRef } from 'react';

export const useEvents = ({
  wrapperRef,
  contentRef,
  disabled,
  resizeCallback,
  scrollCallback,
  childChangeCallback,
}: {
  wrapperRef: RefObject<HTMLElement | null>;
  contentRef: RefObject<HTMLElement | null>;
  disabled?: boolean;
  childChangeCallback: (elm: HTMLElement) => void;
  resizeCallback: (elm: HTMLElement) => void;
  scrollCallback: (elm: HTMLElement) => void;
}) => {
  const contentSizeCache = useRef({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (disabled) {
      return;
    }
    // 监听 wrapperRef
    if (wrapperRef.current) {
      const wrapperElm = wrapperRef.current;
      let wrapperObserver: ResizeObserver | null = null;
      let contentObserver: ResizeObserver | null = null;
      let scrollController: AbortController | null = null;

      // 监听判断是否出现滚动条
      // 子元素的改变
      // const mutationObserver = new MutationObserver(() => {
      //   childChangeCallback(elm);
      // });
      // mutationObserver.observe(elm, {
      //   subtree: true,
      //   childList: true,
      // });
      if (contentRef.current) {
        const contentElm = contentRef.current;

        contentObserver = new ResizeObserver(ev => {
          const { width, height } = ev[0].contentRect;
          if (
            width !== contentSizeCache.current.width ||
            height !== contentSizeCache.current.height
          ) {
            contentSizeCache.current.width = width;
            contentSizeCache.current.height = height;
            childChangeCallback(wrapperElm);
          }
        });
        contentObserver.observe(contentElm);
      }

      // 自身 size 的改变
      wrapperObserver = new ResizeObserver(() => {
        resizeCallback(wrapperElm);
      });
      wrapperObserver.observe(wrapperElm);

      // 滚动事件
      scrollController = new AbortController();
      wrapperElm.addEventListener('scroll', () => scrollCallback(wrapperElm), {
        signal: scrollController.signal,
      });

      // 解绑事件
      return () => {
        scrollController?.abort();
        // mutationObserver.disconnect();
        wrapperObserver?.disconnect();
        contentObserver?.disconnect();
      };
    }
  }, []);
};
