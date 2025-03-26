import {
  KeyboardArrowDownOutlined,
  KeyboardArrowLeftOutlined,
  KeyboardArrowRightOutlined,
  KeyboardArrowUpOutlined,
} from '@mui/icons-material';
import { Box, SxProps, Theme } from '@mui/material';
import { forwardRef, useMemo, useRef } from 'react';
import { useEvents } from './hooks/useEvents';
import { useExportHandlers } from './hooks/useExportHandlers';
import { useScrollStatus } from './hooks/useScrollStatus';
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
    const contentRef = useRef<HTMLElement>(null);

    // 检测滚动状态，展示浮动条
    const { scrollStatus, detectScrollExistIdle } = useScrollStatus();
    const {
      isScrollableX,
      isScrollableY,
      isScrollAtTop,
      isScrollAtBottom,
      isScrollAtLeft,
      isScrollAtRight,
    } = scrollStatus;

    // 虚拟列表
    const { renderIndexes, enableVirtualList } = useVirtualList(
      contentRef,
      scrollStatus,
      virtualListConfig
    );

    // 绑定事件
    useEvents({
      wrapperRef,
      contentRef,
      // 虚拟列表和浮动条同时不启用时，禁用事件
      disabled: !!floatBarDisabled && !virtualListConfig,
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

    const CustomVirtualListWrapper = useMemo(
      () => virtualListConfig?.RowWrapperComponent,
      [virtualListConfig?.RowWrapperComponent]
    );

    const virtualChildren = useMemo(() => {
      if (!virtualListConfig || !renderIndexes) return children;

      const items = Array.from({ length: renderIndexes[1] - renderIndexes[0] + 1 }, (_, index) => {
        const realIndex = index + renderIndexes[0];
        return virtualListConfig.renderRow(realIndex, {
          transform: `translateY(${renderIndexes[0] * virtualListConfig.childHeight}px)`,
        });
      });

      return items;
    }, [children, renderIndexes, virtualListConfig]);

    return (
      <StyledScrollBoxWrapper sx={sx}>
        <StyledScrollBoxContent ref={wrapperRef}>
          <Box ref={contentRef}>
            {enableVirtualList ? (
              CustomVirtualListWrapper ? (
                <CustomVirtualListWrapper>{virtualChildren}</CustomVirtualListWrapper>
              ) : (
                virtualChildren
              )
            ) : (
              children
            )}
          </Box>
        </StyledScrollBoxContent>

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
