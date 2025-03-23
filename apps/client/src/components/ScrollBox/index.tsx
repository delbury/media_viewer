import { useThrottle } from '@/hooks/useThrottle';
import { KeyboardArrowDownOutlined, KeyboardArrowUpOutlined } from '@mui/icons-material';
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
  scrollToBottom: () => void;
  scrollToRight: () => void;
}

// 滚动到顶部或者底部的阈值
const SCROLL_THRESHOLD = 20;

const ScrollBox = forwardRef<ScrollBoxInstance, ScrollBoxProps>(({ children, sx, floatBarDisabled }, ref) => {
  const wrapperRef = useRef<HTMLElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const [isScrollAtTop, setIsScrollAtTop] = useState(true);
  const [isScrollAtBottom, setIsScrollAtBottom] = useState(false);

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
      scrollToBottom: () => {
        scrollTo({ top: wrapperRef.current?.scrollHeight });
      },
      scrollToRight: () => {
        scrollTo({ left: wrapperRef.current?.scrollLeft });
      },
    }),
    [scrollTo]
  );

  // 检测滚动状态
  const detectScrollExist = useCallback(
    (elm: HTMLElement) => {
      const { clientHeight, scrollHeight, scrollTop } = elm;
      // 加一点阈值
      const curIsScrollable = clientHeight < scrollHeight;
      const curIsAtTop = scrollTop <= SCROLL_THRESHOLD;
      const curIsAtBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight - SCROLL_THRESHOLD;

      setIsScrollable(curIsScrollable);
      setIsScrollAtTop(curIsAtTop);
      setIsScrollAtBottom(curIsAtBottom);
    },
    [setIsScrollable, setIsScrollAtTop, setIsScrollAtBottom]
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
      const fnScroll = () => {
        detectScrollExistIdle(elm);
      };
      elm.addEventListener('scroll', fnScroll);

      // 解绑事件
      return () => {
        elm.removeEventListener('scroll', fnScroll);
        mutationObserver.disconnect();
        resizeObserver.disconnect();
      };
    }
  }, []);

  return (
    <StyledScrollBoxWrapper sx={sx}>
      <StyledScrollBoxContent ref={wrapperRef}>{children}</StyledScrollBoxContent>

      {!floatBarDisabled && isScrollable && !isScrollAtTop && (
        <StyledScrollFloatTipBar isAtTop>
          <KeyboardArrowUpOutlined
            fontSize="small"
            sx={{ marginBottom: '-2px' }}
          />
        </StyledScrollFloatTipBar>
      )}
      {!floatBarDisabled && isScrollable && !isScrollAtBottom && (
        <StyledScrollFloatTipBar isAtBottom>
          <KeyboardArrowDownOutlined
            fontSize="small"
            sx={{ marginTop: '-2px' }}
          />
        </StyledScrollFloatTipBar>
      )}
    </StyledScrollBoxWrapper>
  );
});

ScrollBox.displayName = 'ScrollBox';

export default ScrollBox;
