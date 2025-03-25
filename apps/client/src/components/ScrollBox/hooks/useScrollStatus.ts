import { useThrottle } from '@/hooks/useThrottle';
import { useCallback, useState } from 'react';

export type ScrollStatus = Pick<
  HTMLElement,
  'scrollTop' | 'scrollLeft' | 'scrollHeight' | 'scrollWidth' | 'clientHeight' | 'clientWidth'
>;

const SCROLL_THRESHOLD = 20;

export const useScrollStatus = () => {
  const [isScrollableX, setIsScrollableX] = useState(false);
  const [isScrollableY, setIsScrollableY] = useState(false);
  const [isScrollAtTop, setIsScrollAtTop] = useState(true);
  const [isScrollAtBottom, setIsScrollAtBottom] = useState(false);
  const [isScrollAtLeft, setIsScrollAtLeft] = useState(true);
  const [isScrollAtRight, setIsScrollAtRight] = useState(false);
  const [scrollStatus, setScrollStatus] = useState<ScrollStatus | null>(null);

  // 检测滚动状态
  const detectScrollExist = useCallback(
    (elm: HTMLElement) => {
      const { clientHeight, scrollHeight, scrollTop, clientWidth, scrollWidth, scrollLeft } = elm;
      setScrollStatus({
        clientHeight,
        scrollHeight,
        scrollTop,
        clientWidth,
        scrollWidth,
        scrollLeft,
      });

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
    scrollStatus,
    isScrollableX,
    isScrollableY,
    isScrollAtTop,
    isScrollAtBottom,
    isScrollAtLeft,
    isScrollAtRight,
    detectScrollExistIdle,
  };
};
