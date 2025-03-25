import {
  KeyboardArrowDownOutlined,
  KeyboardArrowLeftOutlined,
  KeyboardArrowRightOutlined,
  KeyboardArrowUpOutlined,
} from '@mui/icons-material';
import { SxProps, Theme } from '@mui/material';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { FnScrollTo, useFloatBar } from './hooks/useFloatBar';
import { StyledScrollBoxContent, StyledScrollBoxWrapper, StyledScrollFloatTipBar } from './style';

export interface ScrollBoxProps {
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
  // 展示可滚动的提示悬浮条
  floatBarDisabled?: boolean;
  // 使用虚拟列表
  virtualList?: {
    childCount: number;
    childHeight: number;
  };
}

export interface ScrollBoxInstance {
  scrollTo: FnScrollTo;
  scrollToEnd: () => void;
}

const ScrollBox = forwardRef<ScrollBoxInstance, ScrollBoxProps>(
  ({ children, sx, floatBarDisabled, virtualList }, ref) => {
    const wrapperRef = useRef<HTMLElement>(null);

    // 检测滚动状态，展示浮动条
    const { isScrollableX, isScrollableY, isScrollAtTop, isScrollAtBottom, isScrollAtLeft, isScrollAtRight, scrollTo } =
      useFloatBar(wrapperRef, floatBarDisabled);

    // 暴露给父组件
    useImperativeHandle(
      ref,
      () => ({
        scrollTo,
        scrollToEnd: () => {
          scrollTo({ top: wrapperRef.current?.scrollHeight, left: wrapperRef.current?.scrollWidth });
        },
      }),
      [scrollTo, wrapperRef]
    );

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
  }
);

ScrollBox.displayName = 'ScrollBox';

export default ScrollBox;
