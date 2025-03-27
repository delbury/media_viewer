import ResizeContainer from '@/components/ResizeContainer';
import { List } from '@mui/material';
import { DirectoryInfo } from '@shared';
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
}

const DirectoryItemList = ({ dirs, onClick }: DirectoryItemListProps) => {
  const t = useTranslations();

  const { sortedItems, SortToolRow } = useSortList({
    items: dirs,
    apiFieldMap: DIRECTORY_SORT_API_FIELD_MAP,
    persistentKeyPrefix: 'directoryPickerFolders',
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
          renderItem: (index, { renderStartIndex, childHeight }) => {
            const dir = sortedItems[index];
            return (
              !!dir && (
                <DirectoryItem
                  key={dir.fullPath}
                  dir={dir}
                  onClick={() => onClick?.(dir)}
                  sx={{
                    transform: `translateY(${renderStartIndex * childHeight}px)`,
                  }}
                />
              )
            );
          },
          RowWrapperComponent: ({ children }: { children: React.ReactNode }) => (
            <List sx={{ padding: 0 }}>{children}</List>
          ),
        },
      }}
    />
  );
};

export default DirectoryItemList;
