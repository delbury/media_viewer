import { RefObject, useCallback, useEffect, useRef } from 'react';

export const useEvents = ({
  wrapperRef,
  contentRef,
  disabled,
  selfResizeCallback,
  scrollCallback,
  childResizeCallback,
}: {
  wrapperRef: RefObject<HTMLElement | null>;
  contentRef: RefObject<HTMLElement | null>;
  disabled?:
    | boolean
    | {
        childResizeDisabled?: boolean;
        selfResizeDisabled?: boolean;
        scrollDisabled?: boolean;
      };
  childResizeCallback?: (elm: HTMLElement) => void;
  selfResizeCallback?: (elm: HTMLElement) => void;
  scrollCallback?: (elm: HTMLElement) => void;
}) => {
  const contentSizeCache = useRef({
    width: 0,
    height: 0,
  });
  const wrapperObserver = useRef<ResizeObserver>(null);
  const contentObserver = useRef<ResizeObserver>(null);
  const scrollController = useRef<AbortController>(null);

  const resetEvents = useCallback(() => {
    scrollController.current?.abort();
    wrapperObserver.current?.disconnect();
    contentObserver.current?.disconnect();
    wrapperObserver.current = null;
    contentObserver.current = null;
    scrollController.current = null;
  }, []);

  useEffect(() => {
    resetEvents();
    if (typeof disabled === 'boolean' && disabled) {
      return;
    }
    const { childResizeDisabled, selfResizeDisabled, scrollDisabled } =
      typeof disabled === 'object' ? disabled : {};
    // 监听 wrapperRef
    if (wrapperRef.current) {
      const wrapperElm = wrapperRef.current;

      // 监听判断是否出现滚动条
      // const mutationObserver = new MutationObserver(() => {
      //   childChangeCallback(elm);
      // });
      // mutationObserver.observe(elm, {
      //   subtree: true,
      //   childList: true,
      // });

      // 子元素的改变
      if (contentRef.current && !childResizeDisabled) {
        const contentElm = contentRef.current;

        contentObserver.current = new ResizeObserver(ev => {
          const { width, height } = ev[0].contentRect;
          if (
            width !== contentSizeCache.current.width ||
            height !== contentSizeCache.current.height
          ) {
            contentSizeCache.current.width = width;
            contentSizeCache.current.height = height;
            childResizeCallback?.(wrapperElm);
          }
        });
        contentObserver.current.observe(contentElm);
      }

      // 自身 size 的改变
      if (!selfResizeDisabled) {
        wrapperObserver.current = new ResizeObserver(() => {
          selfResizeCallback?.(wrapperElm);
        });
        wrapperObserver.current.observe(wrapperElm);
      }

      // 滚动事件
      if (!scrollDisabled) {
        scrollController.current = new AbortController();
        wrapperElm.addEventListener('scroll', () => scrollCallback?.(wrapperElm), {
          signal: scrollController.current.signal,
        });
      }

      // 解绑事件
      return () => {
        resetEvents();
      };
    }
  }, [disabled]);
};
