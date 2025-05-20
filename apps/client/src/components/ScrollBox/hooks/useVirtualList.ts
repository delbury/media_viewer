import { LazyLoadObserve } from '#/hooks/useLazyLoad';
import { useThrottle } from '#/hooks/useThrottle';
import { RefObject, useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollStatus } from './useScrollStatus';

export interface RenderRange {
  startIndex: number;
  endIndex: number;
  renderStartRowIndex: number;
  count: number;
  rowHeight: number;
  // 保存计算出当前 range 时的 scrollTop
  scrollTop: number;
  clientHeight: number;
  // 当前渲染元素的 y 轴偏移距离
  offsetY: number;
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
export interface VirtualListChildItemProps {
  index: number;
  params: RenderRange;
  observe: LazyLoadObserve;
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
  ChildItem: React.FC<Record<string, unknown> & VirtualListChildItemProps>;
  // 子元素的 key
  getChildProps: (index: number) => { key: string; [key: string]: unknown };
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
  // 布局
  const gridLayout = config?.calcGridLayout?.(config.childCount, status.clientWidth) ?? null;
  // 子元素高度
  const childHeight = config?.childHeight ?? 0;

  // 子元素行的实际高度 = 子元素高度 + 行 gap
  const childRowHeight = useMemo(() => {
    let height = 1;
    if (gridLayout) {
      height = gridLayout.rowHeight + (gridLayout.rowGap ?? 0);
    } else {
      height = childHeight;
    }
    return Math.max(1, height);
  }, [childHeight, gridLayout]);

  // 总高度
  const totalHeight = useMemo(() => {
    if (!config) return 0;
    if (gridLayout) {
      return (
        gridLayout.rows * gridLayout.rowHeight +
        (gridLayout.rowGap ?? 0) * (gridLayout.rows - 1) +
        (gridLayout.paddingTopBottom ?? 0)
      );
    }
    return config.childCount * childRowHeight;
  }, [childRowHeight, gridLayout, config]);

  const reLayout = useCallback(() => {
    let currentRenderRange: RenderRange;
    const childCount = config?.childCount ?? 0;

    if (gridLayout) {
      // grid 布局
      // 计算当前窗口内的元素的行 index
      const { cols, rows } = gridLayout;
      const visibleRowIndexStart = Math.floor(status.scrollTop / childRowHeight);
      const visibleRowCount = Math.ceil(status.clientHeight / childRowHeight);
      const visibleRowIndexEnd = visibleRowIndexStart + visibleRowCount - 1;

      // 渲染视窗中元素的行数
      const overRowCount =
        typeof config?.overRowCount === 'number'
          ? config.overRowCount
          : Math.ceil(visibleRowCount / 2);

      const startRowIndex = Math.max(0, visibleRowIndexStart - overRowCount);
      const endRowIndex = Math.min(rows - 1, visibleRowIndexEnd + overRowCount);

      const startIndex = startRowIndex * cols;
      const endIndex = Math.min(childCount - 1, endRowIndex * cols + cols - 1);

      currentRenderRange = {
        startIndex,
        endIndex,
        renderStartRowIndex: startRowIndex,
        count: endIndex - startIndex + 1,
        rowHeight: childRowHeight,
        scrollTop: status.scrollTop,
        clientHeight: status.clientHeight,
        offsetY: startRowIndex * childRowHeight,
      };
    } else {
      // 计算当前窗口内的元素 index
      const visibleIndexStart = Math.floor(status.scrollTop / childRowHeight);
      const visibleCount = Math.ceil(status.clientHeight / childRowHeight);
      const visibleIndexEnd = visibleIndexStart + visibleCount - 1;

      // 渲染视窗中元素个数两倍的元素，前后各一半
      const overRowCount =
        typeof config?.overRowCount === 'number'
          ? config.overRowCount
          : Math.ceil(visibleCount / 2);
      const startIndex = Math.max(0, visibleIndexStart - overRowCount);
      const endIndex = Math.min(childCount - 1, visibleIndexEnd + overRowCount);

      currentRenderRange = {
        startIndex,
        endIndex,
        renderStartRowIndex: startIndex,
        count: endIndex - startIndex + 1,
        rowHeight: childRowHeight,
        scrollTop: status.scrollTop,
        clientHeight: status.clientHeight,
        offsetY: startIndex * childRowHeight,
      };
    }
    setRenderRange(currentRenderRange);
  }, [config, gridLayout, status.scrollTop, status.clientHeight, childRowHeight]);
  const reLayoutThrottle = useThrottle(reLayout, 100);

  // 重新计算渲染范围
  useEffect(() => {
    if (status.type === 'resize') {
      // 当滚动高度不变时，不重新计算
      if (
        status.scrollTop === renderRange?.scrollTop &&
        status.clientHeight === renderRange.clientHeight
      )
        return;
    }

    if (status.type === 'scroll') {
      // 给滚动距离加一点阈值
      const threshold =
        ((typeof config?.overRowCount === 'number' ? config.overRowCount : 0) / 2) * childRowHeight;
      const needUpdate = Math.abs(status.scrollTop - (renderRange?.scrollTop ?? 0)) > threshold;
      if (!needUpdate && renderRange) return;
    }

    reLayoutThrottle();
  }, [status]);

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
  };
};
