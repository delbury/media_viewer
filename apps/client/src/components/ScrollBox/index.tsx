import {
  KeyboardArrowDownOutlined,
  KeyboardArrowLeftOutlined,
  KeyboardArrowRightOutlined,
  KeyboardArrowUpOutlined,
} from '@mui/icons-material';
import { SxProps, Theme } from '@mui/material';
import { forwardRef, useRef } from 'react';
import { useEvents } from './hooks/useEvents';
import { useExportHandlers } from './hooks/useExportHandlers';
import { useFloatBar } from './hooks/useFloatBar';
import { useVirtualList, VirtualListConfig } from './hooks/useVirtualList';
import { StyledScrollBoxContent, StyledScrollBoxWrapper, StyledScrollFloatTipBar } from './style';

import { ScrollBoxInstance } from './hooks/useExportHandlers';
export type { ScrollBoxInstance };
export interface ScrollBoxProps {
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
  // 展示可滚动的提示悬浮条
  floatBarDisabled?: boolean;
  // 使用虚拟列表
  virtualListConfig?: VirtualListConfig;
}

const ScrollBox = forwardRef<ScrollBoxInstance, ScrollBoxProps>(
  ({ children, sx, floatBarDisabled, virtualListConfig }, ref) => {
    const wrapperRef = useRef<HTMLElement>(null);

    // 检测滚动状态，展示浮动条
    const {
      isScrollableX,
      isScrollableY,
      isScrollAtTop,
      isScrollAtBottom,
      isScrollAtLeft,
      isScrollAtRight,
      detectScrollExistIdle,
    } = useFloatBar(wrapperRef, floatBarDisabled);

    // 虚拟列表
    useVirtualList(wrapperRef, virtualListConfig);

    // 绑定事件
    useEvents({
      wrapperRef,
      disabled: !!floatBarDisabled,
      resizeCallback: elm => {
        detectScrollExistIdle(elm);
      },
      scrollCallback: elm => {
        detectScrollExistIdle(elm);
      },
      childChangeCallback: elm => {
        detectScrollExistIdle(elm);
      },
    });

    // 暴露给实例方法
    useExportHandlers(ref, wrapperRef);

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
