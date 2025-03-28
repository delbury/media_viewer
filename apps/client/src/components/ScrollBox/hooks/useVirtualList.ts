import { RefObject, useEffect, useMemo, useState } from 'react';
import { ScrollStatus } from './useScrollStatus';

export interface RenderRange {
  startIndex: number;
  endIndex: number;
  renderStartRowIndex: number;
  count: number;
  rowHeight: number;
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
  // 上下间距和
  paddingTopBottom?: number;
}
export interface VirtualListConfig {
  // 子元素数量
  childCount: number;
  // 子元素高度
  childHeight?: number;
  // 计算 grid 布局时的行高和列数等信息
  calcGridLayout?: (childCount: number, contentWidth: number) => GridLayout;
  // 在渲染视窗前、后渲各渲染的最大元素个数
  // grid 布局时，为行数
  overRowCount?: number | 'auto';
  // 渲染子元素
  renderItem: (index: number, params: RenderRange) => React.ReactNode;
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
  const [renderRange, setRenderRange] = useState<RenderRange | null>(null);

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
        gridLayout.rows * gridLayout.rowHeight +
        (gridLayout.rowGap ?? 0) * (gridLayout.rows - 1) +
        (gridLayout.paddingTopBottom ?? 0)
      );
    }
    return config.childCount * childHeight;
  }, [childHeight, gridLayout, config]);

  useEffect(() => {
    if (!config) return;

    if (gridLayout) {
      // grid 布局
      // 计算当前窗口内的元素的行 index
      const { cols, rows, rowHeight, rowGap = 0 } = gridLayout;
      const height = rowHeight + rowGap;
      const visibleRowIndexStart = Math.floor(status.scrollTop / height);
      const visibleRowCount = Math.ceil(status.clientHeight / height);
      const visibleRowIndexEnd = visibleRowIndexStart + visibleRowCount - 1;

      // 渲染视窗中元素的行数
      const overRowCount =
        typeof config.overRowCount === 'number'
          ? config.overRowCount
          : Math.ceil(visibleRowCount / 2);

      const startRowIndex = Math.max(0, visibleRowIndexStart - overRowCount);
      const endRowIndex = Math.min(rows - 1, visibleRowIndexEnd + overRowCount);

      const startIndex = startRowIndex * cols;
      const endIndex = endRowIndex * cols + cols - 1;

      setRenderRange({
        startIndex,
        endIndex,
        renderStartRowIndex: startRowIndex,
        count: (endIndex - startIndex + 1) * cols,
        rowHeight: height,
      });
    } else {
      // 计算当前窗口内的元素 index
      const visibleIndexStart = Math.floor(status.scrollTop / childHeight);
      const visibleCount = Math.ceil(status.clientHeight / childHeight);
      const visibleIndexEnd = visibleIndexStart + visibleCount - 1;

      // 渲染视窗中元素个数两倍的元素，前后各一半
      const overRowCount =
        typeof config.overRowCount === 'number' ? config.overRowCount : Math.ceil(visibleCount / 2);
      const startIndex = Math.max(0, visibleIndexStart - overRowCount);
      const endIndex = Math.min(config.childCount - 1, visibleIndexEnd + overRowCount);

      setRenderRange({
        startIndex,
        endIndex,
        renderStartRowIndex: startIndex,
        count: endIndex - startIndex + 1,
        rowHeight: childHeight,
      });
    }
  }, [
    config,
    status.scrollTop,
    status.clientHeight,
    status.scrollHeight,
    config?.overRowCount,
    config?.childCount,
    childHeight,
    gridLayout,
  ]);

  // 限制子元素的尺寸
  useEffect(() => {
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
    renderRange,
    childHeight,
    gridLayout,
  };
};
