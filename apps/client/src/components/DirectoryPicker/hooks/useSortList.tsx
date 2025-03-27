import { useMemo } from 'react';

export type SortMode = 'desc' | 'asc';

// 排序
const sortItems = function <T, F extends string>({
  items,
  sortMode,
  sortField,
  apiFieldMap,
}: {
  items: T[];
  sortMode: SortMode | null;
  sortField: F[];
  apiFieldMap: Record<F, keyof T>;
}) {
  if (!sortMode || !sortField.length) return items;

  const biggerNum = sortMode === 'asc' ? 1 : -1;
  const newList = [...items];
  newList.sort((a, b) => {
    for (const field of sortField) {
      // 依次比较每个排序字段，直到字段的值不相同
      const apiField = apiFieldMap[field];
      if (a[apiField] === b[apiField]) continue;
      if ((a[apiField] ?? 0) > (b[apiField] ?? 0)) return biggerNum;
      else return -biggerNum;
    }
    return 0;
  });

  return newList;
};

export const useSortList: typeof sortItems = function ({
  items,
  sortMode,
  sortField,
  apiFieldMap,
}) {
  const sortedItems = useMemo(() => {
    return sortItems({ items, sortMode, sortField, apiFieldMap });
  }, [items, sortMode, sortField, apiFieldMap]);

  return sortedItems;
};
