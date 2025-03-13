import { formatDate } from '@/utils';
import { FolderOutlined } from '@mui/icons-material';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { DirectoryInfo } from '@shared';
import { useTranslations } from 'next-intl';

interface DirectoryItemProps {
  dir: DirectoryInfo;
  onClick?: () => void;
}

const DirectoryItem = ({ dir, onClick }: DirectoryItemProps) => {
  const t = useTranslations();

  return (
    <ListItemButton
      key={dir.name}
      onClick={onClick}
    >
      <ListItemIcon>
        <FolderOutlined fontSize="large" />
      </ListItemIcon>

      <ListItemText
        primary={dir.name}
        secondary={
          <>
            <span>{formatDate(dir.updated)}</span>
            <span>
              {dir.files?.length} {t('Common.Files')}
            </span>
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
