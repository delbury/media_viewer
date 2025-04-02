import ScrollBox from '#/components/ScrollBox';
import { usePersistentConfig } from '#/hooks/usePersistentConfig';
import { useMemo } from 'react';
import ToolGroupBtn from '../components/ToolGroupBtn';
import { FileSortField } from '../constant';
import { StyledFileToolRow } from '../style/file-item-list';
import { useResetBtn } from './useResetBtn';

export type SortMode = 'desc' | 'asc';

// 排序
const sortItems = <T, F extends string>({
  items,
  sortMode,
  sortField,
  apiFieldMap,
}: {
  items: T[];
  sortMode: SortMode | null;
  sortField: F[];
  apiFieldMap: Record<F, keyof T>;
}) => {
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

const DEFAULT_VALUES = {
  sortMode: null satisfies SortMode | null,
  sortField: [] satisfies FileSortField[],
};

interface SortItemParams<T, F extends string> {
  items: T[];
  apiFieldMap: Record<F, keyof T>;
  persistentKeyPrefix?: string;
  fileSortOptions: { label: string; value: F }[];
}

export const useSortList = <T, F extends string>({
  items,
  apiFieldMap,
  fileSortOptions,
  persistentKeyPrefix,
}: SortItemParams<T, F>) => {
  const [sortMode, setSortMode] = usePersistentConfig<SortMode | null>(
    DEFAULT_VALUES.sortMode,
    persistentKeyPrefix ? `${persistentKeyPrefix}SortMode` : void 0
  );
  const [sortField, setSortField] = usePersistentConfig<F[]>(
    DEFAULT_VALUES.sortField,
    persistentKeyPrefix ? `${persistentKeyPrefix}SortField` : void 0
  );

  const { ResetBtn: ResetSortBtn } = useResetBtn(() => {
    setSortMode(DEFAULT_VALUES.sortMode);
    setSortField(DEFAULT_VALUES.sortField);
  });

  const sortedItems = useMemo(() => {
    return sortItems({ items, sortMode, sortField, apiFieldMap });
  }, [items, sortMode, sortField, apiFieldMap]);

  const SortToolRow = useMemo(() => {
    return (
      <StyledFileToolRow>
        {ResetSortBtn}
        <ToolGroupBtn
          exclusive
          value={sortMode}
          onChange={(_, value) => setSortMode(value)}
          items={[
            { value: 'desc', label: 'Common.Desc' },
            { value: 'asc', label: 'Common.Asc' },
          ]}
        />
        <ScrollBox>
          <ToolGroupBtn
            items={fileSortOptions}
            value={sortField}
            onChange={(_, value) => setSortField(value)}
            showOrder
          />
        </ScrollBox>
      </StyledFileToolRow>
    );
  }, [ResetSortBtn, fileSortOptions, sortMode, sortField, setSortField, setSortMode]);

  return {
    sortedItems,
    SortToolRow,
  };
};
