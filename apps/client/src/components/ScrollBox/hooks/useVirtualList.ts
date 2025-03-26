import { SxProps, Theme } from '@mui/material';
import { RefObject, useLayoutEffect, useMemo, useState } from 'react';
import { ScrollStatus } from './useScrollStatus';

export interface VirtualListConfig {
  // 子元素数量
  childCount: number;
  // 子元素高度
  childHeight: number;
  // 在渲染视窗前、后渲各渲染的最大元素个数
  overCount?: number | 'auto';
  // 渲染行
  renderRow: (index: number, sx: SxProps<Theme>) => React.ReactNode;
  // 行包裹组件
  RowWrapperComponent?: React.FC<{ children: React.ReactNode }>;
}

/**
 * 暂时只支持 y 轴的虚拟列表
 * 实现逻辑
 * 通过 childCount 和 childHeight 计算出虚拟列表的高度
 * 通过虚拟列表的高度和当前滚动位置计算出当前显示的元素
 * 通过当前显示的元素计算出当前显示的元素的索引
 */
export const useVirtualList = (
  contentRef: RefObject<HTMLElement | null>,
  status: ScrollStatus,
  config?: VirtualListConfig
) => {
  const [renderIndexes, setRenderIndexes] = useState<[number, number] | null>(null);

  const enable = !!config;

  const totalHeight = useMemo(() => {
    return enable ? config.childCount * config.childHeight : 0;
  }, [enable, config?.childCount, config?.childHeight]);

  useLayoutEffect(() => {
    if (!enable) return;
    // 计算当前窗口内的元素 index
    const visibleIndexStart = Math.floor(status.scrollTop / config.childHeight);
    const visibleCount = Math.ceil(status.clientHeight / config.childHeight);
    const visibleIndexEnd = visibleIndexStart + visibleCount - 1;

    // 渲染视窗中元素个数两倍的元素，前后各一半
    const overCount =
      typeof config.overCount === 'number' ? config.overCount : Math.ceil(visibleCount / 2);
    const startIndex = Math.max(0, visibleIndexStart - overCount);
    const endIndex = Math.min(config.childCount - 1, visibleIndexEnd + overCount);

    setRenderIndexes([startIndex, endIndex]);
  }, [
    enable,
    status.scrollTop,
    status.clientHeight,
    status.scrollHeight,
    config?.childHeight,
    config?.overCount,
    config?.childCount,
  ]);

  // 限制子元素的尺寸
  useLayoutEffect(() => {
    if (!contentRef.current) return;
    const contentElm = contentRef.current;

    if (enable) {
      contentElm.style.setProperty('height', `${totalHeight}px`, 'important');
      contentElm.style.setProperty('overflow-y', 'hidden', 'important');
    } else {
      contentElm.style.removeProperty('height');
      contentElm.style.removeProperty('overflow-y');
    }
  }, [enable, totalHeight, contentRef]);

  return {
    enableVirtualList: enable,
    renderIndexes,
  };
};
