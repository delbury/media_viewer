import { RefObject, useLayoutEffect, useMemo, useState } from 'react';
import { ScrollStatus } from './useScrollStatus';

interface RenderItemParams {
  renderStartIndex: number;
  renderEndIndex: number;
  childHeight: number;
}

export interface GridLayout {
  // 行数
  rows: number;
  // 列数
  cols: number;
  // 行高
  rowHeight: number;
  // 列宽
  colWidth: number;
  // 行间距
  rowGap?: number;
  // 列间距
  colGap?: number;
}
export interface VirtualListConfig {
  // 子元素数量
  childCount: number;
  // 子元素高度
  childHeight?: number;
  // 计算 grid 布局时的行高和列数等信息
  calcGridLayout?: (childCount: number, contentWidth: number) => GridLayout;
  // 在渲染视窗前、后渲各渲染的最大元素个数
  overCount?: number | 'auto';
  // 渲染子元素
  renderItem: (index: number, params: RenderItemParams) => React.ReactNode;
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

  const gridLayout = useMemo(() => {
    if (!config) return null;
    return config?.calcGridLayout?.(config.childCount, status.clientWidth) ?? null;
  }, [config, status.clientWidth]);

  const childHeight = useMemo(() => {
    if (!config) return 0;
    return config.childHeight ?? 0;
  }, [config]);

  const totalHeight = useMemo(() => {
    if (!config) return 0;
    if (gridLayout) {
      return (
        gridLayout.rows * gridLayout.rowHeight + (gridLayout.rowGap ?? 0) * (gridLayout.rows - 1)
      );
    }
    return config.childCount * childHeight;
  }, [childHeight, gridLayout, config]);

  useLayoutEffect(() => {
    if (!config) return;
    // 计算当前窗口内的元素 index
    const visibleIndexStart = Math.floor(status.scrollTop / childHeight);
    const visibleCount = Math.ceil(status.clientHeight / childHeight);
    const visibleIndexEnd = visibleIndexStart + visibleCount - 1;

    // 渲染视窗中元素个数两倍的元素，前后各一半
    const overCount =
      typeof config.overCount === 'number' ? config.overCount : Math.ceil(visibleCount / 2);
    const startIndex = Math.max(0, visibleIndexStart - overCount);
    const endIndex = Math.min(config.childCount - 1, visibleIndexEnd + overCount);

    setRenderIndexes([startIndex, endIndex]);
  }, [
    config,
    status.scrollTop,
    status.clientHeight,
    status.scrollHeight,
    config?.overCount,
    config?.childCount,
    childHeight,
  ]);

  // 限制子元素的尺寸
  useLayoutEffect(() => {
    if (!contentRef.current) return;
    const contentElm = contentRef.current;

    if (config) {
      contentElm.style.setProperty('height', `${totalHeight}px`, 'important');
      contentElm.style.setProperty('overflow-y', 'hidden', 'important');
    } else {
      contentElm.style.removeProperty('height');
      contentElm.style.removeProperty('overflow-y');
    }
  }, [config, totalHeight, contentRef]);

  return {
    enableVirtualList: !!config,
    renderIndexes,
    childHeight,
  };
};
