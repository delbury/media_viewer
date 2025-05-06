import { formatDate } from '#/utils';
import { DirectoryInfo } from '#pkgs/apis';
import { FolderOutlined, SourceOutlined } from '@mui/icons-material';
import { ListItemIcon, ListItemText, ListItemTextProps, SxProps, Theme } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { DIRECTORY_ITEM_HEIGHT } from '../constant';
import { StyledListItemButton } from '../style/directory-item';

interface DirectoryItemProps {
  dir: DirectoryInfo;
  onClick?: (dir: DirectoryInfo) => void;
  sx?: SxProps<Theme>;
}

const LIST_ITEM_TEXT_SLOT_PROPS: ListItemTextProps['slotProps'] = {
  primary: {
    sx: {
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      fontSize: '0.875rem',
    },
  },
  secondary: {
    sx: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '0.75rem',
      lineHeight: 1.2,
    },
  },
};

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
      <ListItemIcon sx={{ minWidth: 36 }}>
        {isEmpty ? <FolderOutlined /> : <SourceOutlined />}
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
        slotProps={LIST_ITEM_TEXT_SLOT_PROPS}
      />
    </StyledListItemButton>
  );
};

export default DirectoryItem;
