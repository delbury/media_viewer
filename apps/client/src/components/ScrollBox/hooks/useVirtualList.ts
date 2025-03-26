import { RefObject, useEffect, useLayoutEffect, useMemo } from 'react';
import { ScrollStatus } from './useScrollStatus';

export interface VirtualListConfig {
  // 子元素数量
  childCount: number;
  // 子元素高度
  childHeight: number;
}

/**
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
  const enable = !!config;

  const totalHeight = useMemo(() => {
    return (config?.childCount ?? 0) * (config?.childHeight ?? 0);
  }, [config?.childCount, config?.childHeight]);

  useEffect(() => {
    console.log(status.scrollTop);
  }, [status.scrollTop]);

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

  return {};
};
