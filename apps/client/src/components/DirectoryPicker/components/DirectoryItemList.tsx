import ResizeContainer from '@/components/ResizeContainer';
import { List } from '@mui/material';
import { DirectoryInfo } from '@shared';
import { useTranslations } from 'next-intl';
import DirectoryItem from './DirectoryItem';

interface DirectoryItemListProps {
  dirs: DirectoryInfo[];
  onClick?: (dir: DirectoryInfo) => void;
}

const DirectoryItemList = ({ dirs, onClick }: DirectoryItemListProps) => {
  const t = useTranslations();

  return (
    <ResizeContainer
      // title={t('Tools.CurrentDirectories')}
      emptyText={t('Tools.NoDirectories')}
      isEmpty={!dirs.length}
    >
      {dirs.length && (
        <List sx={{ padding: 0 }}>
          {dirs.map(dir => (
            <DirectoryItem
              key={dir.fullPath}
              dir={dir}
              onClick={() => onClick?.(dir)}
            />
          ))}
        </List>
      )}
    </ResizeContainer>
  );
};

export default DirectoryItemList;
