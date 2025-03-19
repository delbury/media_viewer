import { formatDate } from '@/utils';
import { FolderOutlined } from '@mui/icons-material';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { DirectoryInfo } from '@shared';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

interface DirectoryItemProps {
  dir: DirectoryInfo;
  onClick?: () => void;
}

const DirectoryItem = ({ dir, onClick }: DirectoryItemProps) => {
  const t = useTranslations();

  const timeInfo = useMemo(
    () => `${t('Tools.UpdatedTime')}${t('Common.Colon')}${formatDate(dir.updated)}`,
    [t, dir.updated]
  );
  const fileInfo = useMemo(
    () => `${t('Common.Total')} ${dir.files?.length ?? 0} ${t('Common.Files')}`,
    [t, dir.files?.length]
  );

  return (
    <ListItemButton
      key={dir.name}
      onClick={onClick}
      sx={{ paddingLeft: 0, paddingRight: 0 }}
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
    </ListItemButton>
  );
};

export default DirectoryItem;
