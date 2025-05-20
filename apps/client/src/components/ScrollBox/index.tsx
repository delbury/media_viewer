import { useLazyLoad } from '#/hooks/useLazyLoad';
import {
  KeyboardArrowDownOutlined,
  KeyboardArrowLeftOutlined,
  KeyboardArrowRightOutlined,
  KeyboardArrowUpOutlined,
} from '@mui/icons-material';
import { Box, SxProps, Theme } from '@mui/material';
import { forwardRef, useCallback, useEffect, useMemo, useRef } from 'react';
import Empty from '../Empty';
import Loading from '../Loading';
import { useEvents } from './hooks/useEvents';
import { ScrollBoxInstance, useExportHandlers } from './hooks/useExportHandlers';
import { useScrollStatus } from './hooks/useScrollStatus';
import { useVirtualList, VirtualListConfig } from './hooks/useVirtualList';
import {
  BarPosition,
  StyledEmptyWrapper,
  StyledScrollBoxContent,
  StyledScrollBoxWrapper,
  StyledScrollFloatTipBar,
} from './style';
export type { ScrollBoxInstance };

export interface ScrollBoxProps {
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
  // 展示可滚动的提示悬浮条
  floatBarDisabled?: boolean;
  // 使用虚拟列表
  virtualListConfig?: VirtualListConfig;
  // 是否启用懒加载
  lazyLoadEnabled?: boolean;
  // 隐藏滚动条，仍可以滚动
  hideScrollbar?: boolean;
  ref?: React.Ref<ScrollBoxInstance>;
  // 无内容
  emptyText?: string;
  isEmpty?: boolean;
  isLoading?: boolean;
  // 挂载后默认滚动到的位置
  defaultScroll?: {
    left?: number;
    top?: number;
  };
}

const ScrollBox = forwardRef<ScrollBoxInstance, ScrollBoxProps>(
  (
    {
      children,
      sx,
      floatBarDisabled,
      virtualListConfig,
      lazyLoadEnabled,
      hideScrollbar,
      emptyText,
      isEmpty,
      isLoading,
      defaultScroll,
    },
    ref
  ) => {
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

    // 绑定事件
    useEvents({
      wrapperRef,
      contentRef,
      // 虚拟列表和浮动条同时不启用时，禁用事件
      disabled: !!floatBarDisabled && !virtualListConfig,
      selfResizeCallback: elm => {
        detectScrollExistIdle(elm, 'resize');
      },
      scrollCallback: elm => {
        detectScrollExistIdle(elm, 'scroll');
      },
      childResizeCallback: elm => {
        detectScrollExistIdle(elm, 'childChange');
      },
    });

    // 暴露给实例方法
    const { scrollTo } = useExportHandlers(ref, wrapperRef);

    // 懒加载
    const { observe } = useLazyLoad({
      enabled: lazyLoadEnabled,
      root: wrapperRef.current,
    });

    // 虚拟列表
    const { renderRange, enableVirtualList } = useVirtualList(
      contentRef,
      scrollStatus,
      virtualListConfig
    );

    // 自定义虚拟列表的包裹元素
    const CustomVirtualListWrapper = useMemo(
      () => virtualListConfig?.RowWrapperComponent,
      [virtualListConfig?.RowWrapperComponent]
    );

    // 开启虚拟列表时的子元素
    const VirtualChildren = useMemo(() => {
      if (!virtualListConfig || !renderRange) return children;
      return Array.from({ length: renderRange.count }, (_, index) => {
        const realIndex = index + renderRange.startIndex;
        const ChildItem = virtualListConfig.ChildItem;
        const props = virtualListConfig.getChildProps(realIndex);
        return (
          !!props.key && (
            <ChildItem
              {...props}
              key={props.key}
              index={realIndex}
              params={renderRange}
              observe={observe}
            />
          )
        );
      });
    }, [children, virtualListConfig, renderRange, observe]);

    // 滚动一定距离
    const scrollDirection = useCallback((pos: BarPosition) => {
      const STEP = 80;
      let x = 0;
      let y = 0;
      switch (pos) {
        case 'bottom':
          y = STEP;
          break;
        case 'top':
          y = -STEP;
          break;
        case 'left':
          x = -STEP;
          break;
        case 'right':
          x = STEP;
          break;
      }
      wrapperRef.current?.scrollBy({
        left: x,
        top: y,
        behavior: 'smooth',
      });
    }, []);

    useEffect(() => {
      // 默认滚动到的位置
      scrollTo({
        top: defaultScroll?.top,
        left: defaultScroll?.left,
        behavior: 'instant',
      });
    }, []);

    return (
      <StyledScrollBoxWrapper sx={sx}>
        <StyledScrollBoxContent
          ref={wrapperRef}
          hideScrollbar={hideScrollbar}
        >
          {(isEmpty || isLoading) && (
            <StyledEmptyWrapper>
              {isLoading ? <Loading /> : <Empty label={emptyText} />}
            </StyledEmptyWrapper>
          )}
          <Box ref={contentRef}>
            {enableVirtualList ? (
              CustomVirtualListWrapper ? (
                <CustomVirtualListWrapper>{VirtualChildren}</CustomVirtualListWrapper>
              ) : (
                VirtualChildren
              )
            ) : (
              children
            )}
          </Box>
        </StyledScrollBoxContent>

        {/* 上 */}
        {!floatBarDisabled && isScrollableY && !isScrollAtTop && (
          <StyledScrollFloatTipBar
            barPosition="top"
            onClick={() => scrollDirection('top')}
          >
            <KeyboardArrowUpOutlined
              fontSize="small"
              sx={{ marginBottom: '-2px' }}
            />
          </StyledScrollFloatTipBar>
        )}
        {/* 下 */}
        {!floatBarDisabled && isScrollableY && !isScrollAtBottom && (
          <StyledScrollFloatTipBar
            barPosition="bottom"
            onClick={() => scrollDirection('bottom')}
          >
            <KeyboardArrowDownOutlined
              fontSize="small"
              sx={{ marginTop: '-2px' }}
            />
          </StyledScrollFloatTipBar>
        )}
        {/* 左 */}
        {!floatBarDisabled && isScrollableX && !isScrollAtLeft && (
          <StyledScrollFloatTipBar
            barPosition="left"
            onClick={() => scrollDirection('left')}
          >
            <KeyboardArrowLeftOutlined
              fontSize="small"
              sx={{ marginRight: '-2px' }}
            />
          </StyledScrollFloatTipBar>
        )}
        {/* 右 */}
        {!floatBarDisabled && isScrollableX && !isScrollAtRight && (
          <StyledScrollFloatTipBar
            barPosition="right"
            onClick={() => scrollDirection('right')}
          >
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
