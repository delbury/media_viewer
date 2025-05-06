import ResizeContainer from '#/components/ResizeContainer';
import { VirtualListChildItemProps } from '#/components/ScrollBox/hooks/useVirtualList';
import { DirectoryInfo } from '#pkgs/apis';
import { List } from '@mui/material';
import { useTranslations } from 'next-intl';
import {
  DIRECTORY_ITEM_HEIGHT,
  DIRECTORY_SORT_API_FIELD_MAP,
  DIRECTORY_SORT_OPTIONS,
} from '../constant';
import { useSortList } from '../hooks/useSortList';
import DirectoryItem from './DirectoryItem';

interface DirectoryItemListProps {
  dirs: DirectoryInfo[];
  onClick?: (dir: DirectoryInfo) => void;
  storageKeySuffix?: string;
}

// 行包裹组件
const RowWrapperComponent = ({ children }: { children: React.ReactNode }) => (
  <List sx={{ padding: 0 }}>{children}</List>
);

const ChildItem = (
  props: VirtualListChildItemProps & {
    sortedItems?: DirectoryInfo[];
    onClick?: (dir: DirectoryInfo) => void;
  }
) => {
  const {
    index,
    params: { offsetY },
    sortedItems,
    onClick,
  } = props;

  const dir = sortedItems?.[index];
  return (
    !!dir && (
      <DirectoryItem
        dir={dir}
        onClick={() => onClick?.(dir)}
        sx={{
          transform: `translateY(${offsetY}px)`,
        }}
      />
    )
  );
};

const DirectoryItemList = ({ dirs, onClick, storageKeySuffix = '' }: DirectoryItemListProps) => {
  const t = useTranslations();

  const { sortedItems, SortToolRow } = useSortList({
    items: dirs,
    apiFieldMap: DIRECTORY_SORT_API_FIELD_MAP,
    persistentKeyPrefix: 'directoryPickerFolders',
    persistentKeySuffix: storageKeySuffix,
    fileSortOptions: DIRECTORY_SORT_OPTIONS,
  });

  return (
    <ResizeContainer
      // title={t('Tools.CurrentDirectories')}
      emptyText={t('Tools.NoDirectories')}
      isEmpty={!sortedItems.length}
      beforeContentSlot={SortToolRow}
      scrollBoxProps={{
        virtualListConfig: {
          childCount: sortedItems.length,
          childHeight: DIRECTORY_ITEM_HEIGHT,
          ChildItem,
          getChildProps: (index: number) => ({
            key: sortedItems[index]?.relativePath,
            sortedItems,
            onClick,
          }),
          RowWrapperComponent,
          overRowCount: 5,
        },
      }}
    />
  );
};

export default DirectoryItemList;
