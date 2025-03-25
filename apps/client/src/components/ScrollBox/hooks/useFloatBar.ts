import { useThrottle } from '@/hooks/useThrottle';
import { RefObject, useCallback, useState } from 'react';

const SCROLL_THRESHOLD = 20;

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

  return {
    isScrollableX,
    isScrollableY,
    isScrollAtTop,
    isScrollAtBottom,
    isScrollAtLeft,
    isScrollAtRight,
    detectScrollExistIdle,
  };
};
