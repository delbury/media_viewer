import { formatDate } from '#/utils';
import { DirectoryInfo } from '#pkgs/apis';
import { FolderOutlined, SourceOutlined } from '@mui/icons-material';
import { ListItemIcon, ListItemText, SxProps, Theme } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { DIRECTORY_ITEM_HEIGHT } from '../constant';
import { StyledListItemButton } from '../style/directory-item';

interface DirectoryItemProps {
  dir: DirectoryInfo;
  onClick?: (dir: DirectoryInfo) => void;
  sx?: SxProps<Theme>;
}

const DirectoryItem = ({ dir, onClick, sx }: DirectoryItemProps) => {
  const t = useTranslations();

  const isEmpty = useMemo(() => {
    return !dir.totalFilesCount && !dir.children.length;
  }, [dir.totalFilesCount, dir.children]);

  const timeInfo = useMemo(
    () => `${t('Tools.UpdatedTime')}${t(':')}${formatDate(dir.updated)}`,
    [t, dir.updated]
  );
  const fileInfo = useMemo(
    () => `${t('Common.Total')} ${dir.totalFilesCount} ${t('Common.Files')}`,
    [t, dir.totalFilesCount]
  );

  return (
    <StyledListItemButton
      onClick={() => onClick?.(dir)}
      sx={{ height: `${DIRECTORY_ITEM_HEIGHT}px`, ...sx }}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>
        {isEmpty ? <FolderOutlined fontSize="large" /> : <SourceOutlined fontSize="large" />}
      </ListItemIcon>

      <ListItemText
        primary={dir.name}
        secondary={
          <>
            <span>{timeInfo}</span>
            <span>{fileInfo}</span>
          </>
        }
        sx={{
          margin: 0,
        }}
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
              fontSize: '0.8rem',
            },
          },
        }}
      />
    </StyledListItemButton>
  );
};

export default DirectoryItem;
