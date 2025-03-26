import { useThrottle } from '@/hooks/useThrottle';
import { useCallback, useState } from 'react';

export type ScrollStatus = Pick<
  HTMLElement,
  'scrollTop' | 'scrollLeft' | 'scrollHeight' | 'scrollWidth' | 'clientHeight' | 'clientWidth'
> & {
  isScrollableX: boolean;
  isScrollableY: boolean;
  isScrollAtTop: boolean;
  isScrollAtBottom: boolean;
  isScrollAtLeft: boolean;
  isScrollAtRight: boolean;
};

const SCROLL_THRESHOLD = 20;
const DEFAULT_SCROLL_STATUS: ScrollStatus = {
  scrollTop: 0,
  scrollLeft: 0,
  scrollHeight: 0,
  scrollWidth: 0,
  clientHeight: 0,
  clientWidth: 0,
  isScrollableX: false,
  isScrollableY: false,
  isScrollAtTop: true,
  isScrollAtBottom: false,
  isScrollAtLeft: true,
  isScrollAtRight: false,
};
export const useScrollStatus = () => {
  const [scrollStatus, setScrollStatus] = useState<ScrollStatus>(DEFAULT_SCROLL_STATUS);
  // 检测滚动状态
  const detectScrollExist = useCallback(
    (elm: HTMLElement) => {
      const { clientHeight, scrollHeight, scrollTop, clientWidth, scrollWidth, scrollLeft } = elm;
      const isy = clientHeight < scrollHeight;
      const ist = scrollTop <= SCROLL_THRESHOLD;
      const isb = Math.ceil(scrollTop + clientHeight) >= scrollHeight - SCROLL_THRESHOLD;

      const isx = clientWidth < scrollWidth;
      const isl = scrollLeft <= SCROLL_THRESHOLD;
      const isr = Math.ceil(scrollLeft + clientWidth) >= scrollWidth - SCROLL_THRESHOLD;

      setScrollStatus({
        clientHeight,
        scrollHeight,
        scrollTop,
        clientWidth,
        scrollWidth,
        scrollLeft,
        isScrollableX: isx,
        isScrollableY: isy,
        isScrollAtTop: ist,
        isScrollAtBottom: isb,
        isScrollAtLeft: isl,
        isScrollAtRight: isr,
      });
    },
    [setScrollStatus]
  );
  const detectScrollExistIdle = useThrottle(detectScrollExist, 20);

  return {
    scrollStatus,
    detectScrollExistIdle,
  };
};
