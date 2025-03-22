import { useIdleCallback } from '@/hooks/useIdleCallback';
import { KeyboardArrowDownOutlined, KeyboardArrowUpOutlined } from '@mui/icons-material';
import { SxProps, Theme } from '@mui/material';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { StyledScrollBoxContent, StyledScrollBoxWrapper, StyledScrollFloatTipBar } from './style';

export interface ScrollBoxProps {
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
  // 展示可滚动的提示悬浮条
  floatBarDisabled?: boolean;
}

// 滚动到顶部或者底部的阈值
const SCROLL_THRESHOLD = 10;

const ScrollBox = ({ children, sx, floatBarDisabled }: ScrollBoxProps) => {
  const wrapperRef = useRef<HTMLElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const [isScrollAtTop, setIsScrollAtTop] = useState(true);
  const [isScrollAtBottom, setIsScrollAtBottom] = useState(false);
  const [, startTransition] = useTransition();

  // 检测滚动状态
  const detectScrollExist = useCallback(
    (elm: HTMLElement) => {
      const { clientHeight, scrollHeight, scrollTop } = elm;
      // 加一点阈值
      const curIsScrollable = clientHeight < scrollHeight;
      const curIsAtTop = scrollTop <= SCROLL_THRESHOLD;
      const curIsAtBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight - SCROLL_THRESHOLD;

      startTransition(() => {
        setIsScrollable(curIsScrollable);
        setIsScrollAtTop(curIsAtTop);
        setIsScrollAtBottom(curIsAtBottom);
      });
    },
    [setIsScrollable, setIsScrollAtTop, setIsScrollAtBottom, startTransition]
  );
  const detectScrollExistIdle = useIdleCallback(detectScrollExist, 100);

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
};

export default ScrollBox;
