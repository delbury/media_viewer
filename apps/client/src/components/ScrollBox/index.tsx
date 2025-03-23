import { useThrottle } from '@/hooks/useThrottle';
import {
  KeyboardArrowDownOutlined,
  KeyboardArrowLeftOutlined,
  KeyboardArrowRightOutlined,
  KeyboardArrowUpOutlined,
} from '@mui/icons-material';
import { SxProps, Theme } from '@mui/material';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { StyledScrollBoxContent, StyledScrollBoxWrapper, StyledScrollFloatTipBar } from './style';

export interface ScrollBoxProps {
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
  // 展示可滚动的提示悬浮条
  floatBarDisabled?: boolean;
}

export interface ScrollBoxInstance {
  scrollTo: (params: { top?: number; left?: number }) => void;
  scrollToEnd: () => void;
}

// 滚动到顶部或者底部的阈值
const SCROLL_THRESHOLD = 20;

const ScrollBox = forwardRef<ScrollBoxInstance, ScrollBoxProps>(({ children, sx, floatBarDisabled }, ref) => {
  const wrapperRef = useRef<HTMLElement>(null);
  const [isScrollableX, setIsScrollableX] = useState(false);
  const [isScrollableY, setIsScrollableY] = useState(false);
  const [isScrollAtTop, setIsScrollAtTop] = useState(true);
  const [isScrollAtBottom, setIsScrollAtBottom] = useState(false);
  const [isScrollAtLeft, setIsScrollAtLeft] = useState(true);
  const [isScrollAtRight, setIsScrollAtRight] = useState(false);

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

  useImperativeHandle(
    ref,
    () => ({
      scrollTo,
      scrollToEnd: () => scrollTo({ top: wrapperRef.current?.scrollHeight, left: wrapperRef.current?.scrollWidth }),
    }),
    [scrollTo]
  );

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

  return (
    <StyledScrollBoxWrapper sx={sx}>
      <StyledScrollBoxContent ref={wrapperRef}>{children}</StyledScrollBoxContent>

      {/* 上 */}
      {!floatBarDisabled && isScrollableY && !isScrollAtTop && (
        <StyledScrollFloatTipBar barPosition="top">
          <KeyboardArrowUpOutlined
            fontSize="small"
            sx={{ marginBottom: '-2px' }}
          />
        </StyledScrollFloatTipBar>
      )}
      {/* 下 */}
      {!floatBarDisabled && isScrollableY && !isScrollAtBottom && (
        <StyledScrollFloatTipBar barPosition="bottom">
          <KeyboardArrowDownOutlined
            fontSize="small"
            sx={{ marginTop: '-2px' }}
          />
        </StyledScrollFloatTipBar>
      )}
      {/* 左 */}
      {!floatBarDisabled && isScrollableX && !isScrollAtLeft && (
        <StyledScrollFloatTipBar barPosition="left">
          <KeyboardArrowLeftOutlined
            fontSize="small"
            sx={{ marginRight: '-2px' }}
          />
        </StyledScrollFloatTipBar>
      )}
      {/* 右 */}
      {!floatBarDisabled && isScrollableX && !isScrollAtRight && (
        <StyledScrollFloatTipBar barPosition="right">
          <KeyboardArrowRightOutlined
            fontSize="small"
            sx={{ marginLeft: '-2px' }}
          />
        </StyledScrollFloatTipBar>
      )}
    </StyledScrollBoxWrapper>
  );
});

ScrollBox.displayName = 'ScrollBox';

export default ScrollBox;
