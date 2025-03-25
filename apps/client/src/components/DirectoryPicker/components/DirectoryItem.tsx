import { formatDate } from '@/utils';
import { FolderOutlined } from '@mui/icons-material';
import { ListItemIcon, ListItemText } from '@mui/material';
import { DirectoryInfo } from '@shared';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { DIRECTORY_ITEM_HEIGHT } from '../constant';
import { StyledListItemButton } from '../style/directory-item';

interface DirectoryItemProps {
  dir: DirectoryInfo;
  onClick?: (dir: DirectoryInfo) => void;
}

const DirectoryItem = ({ dir, onClick }: DirectoryItemProps) => {
  const t = useTranslations();

  const timeInfo = useMemo(
    () => `${t('Tools.UpdatedTime')}${t('Common.Colon')}${formatDate(dir.updated)}`,
    [t, dir.updated]
  );
  const fileInfo = useMemo(
    () => `${t('Common.Total')} ${dir.totalFilesCount} ${t('Common.Files')}`,
    [t, dir.totalFilesCount]
  );

  return (
    <StyledListItemButton
      onClick={() => onClick?.(dir)}
      sx={{ height: `${DIRECTORY_ITEM_HEIGHT}px` }}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>
        <FolderOutlined fontSize="large" />
      </ListItemIcon>

      <ListItemText
        primary={dir.name}
        secondary={
          <>
            <span>{timeInfo}</span>
            <span>{fileInfo}</span>
          </>
        }
        slotProps={{
          primary: {
            sx: {
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            },
          },
          secondary: {
            sx: {
              display: 'flex',
              justifyContent: 'space-between',
            },
          },
        }}
      />
    </StyledListItemButton>
  );
};

export default DirectoryItem;
