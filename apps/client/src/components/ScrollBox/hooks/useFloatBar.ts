import { useThrottle } from '@/hooks/useThrottle';
import { RefObject, useCallback, useEffect, useState } from 'react';

const SCROLL_THRESHOLD = 20;

export type FnScrollTo = (params: { top?: number; left?: number }) => void;

export const useFloatBar = (wrapperRef: RefObject<HTMLElement | null>, floatBarDisabled: boolean = false) => {
  const [isScrollableX, setIsScrollableX] = useState(false);
  const [isScrollableY, setIsScrollableY] = useState(false);
  const [isScrollAtTop, setIsScrollAtTop] = useState(true);
  const [isScrollAtBottom, setIsScrollAtBottom] = useState(false);
  const [isScrollAtLeft, setIsScrollAtLeft] = useState(true);
  const [isScrollAtRight, setIsScrollAtRight] = useState(false);

  // 检测滚动状态
  const detectScrollExist = useCallback(
    (elm: HTMLElement) => {
      const { clientHeight, scrollHeight, scrollTop, clientWidth, scrollWidth, scrollLeft } = elm;
      setIsScrollableY(clientHeight < scrollHeight);
      setIsScrollAtTop(scrollTop <= SCROLL_THRESHOLD);
      // 加一点阈值
      setIsScrollAtBottom(Math.ceil(scrollTop + clientHeight) >= scrollHeight - SCROLL_THRESHOLD);

      setIsScrollableX(clientWidth < scrollWidth);
      setIsScrollAtLeft(scrollLeft <= SCROLL_THRESHOLD);
      setIsScrollAtRight(Math.ceil(scrollLeft + clientWidth) >= scrollWidth - SCROLL_THRESHOLD);
    },
    [setIsScrollableY, setIsScrollAtTop, setIsScrollAtBottom]
  );
  const detectScrollExistIdle = useThrottle(detectScrollExist, 20);

  // 绑定事件，实现滚动时，动态显示或隐藏可滚动提示悬浮条
  useEffect(() => {
    if (floatBarDisabled) {
      return;
    }
    if (wrapperRef.current) {
      const elm = wrapperRef.current;

      // 监听判断是否出现滚动条
      // 子元素的改变
      const mutationObserver = new MutationObserver(() => {
        detectScrollExistIdle(elm);
      });
      mutationObserver.observe(elm, {
        subtree: true,
        childList: true,
      });

      // 自身 size 的改变
      const resizeObserver = new ResizeObserver(() => {
        detectScrollExistIdle(elm);
      });
      resizeObserver.observe(elm);

      // 滚动事件
      const controller = new AbortController();
      elm.addEventListener('scroll', () => detectScrollExistIdle(elm), { signal: controller.signal });

      // 解绑事件
      return () => {
        controller.abort();
        mutationObserver.disconnect();
        resizeObserver.disconnect();
      };
    }
  }, []);

  const scrollTo: FnScrollTo = useCallback(
    ({ top, left }) => {
      wrapperRef.current?.scrollTo({
        top,
        left,
        behavior: 'smooth',
      });
    },
    [wrapperRef]
  );

  return {
    isScrollableX,
    isScrollableY,
    isScrollAtTop,
    isScrollAtBottom,
    isScrollAtLeft,
    isScrollAtRight,
    scrollTo,
  };
};
