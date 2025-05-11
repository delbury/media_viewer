import { FileInfo } from '#pkgs/apis';
import { FormatListBulletedRounded } from '@mui/icons-material';
import { Badge, IconButton } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import Dialog from '../Dialog';
import { StyledListPreviewerWrapper } from './style';

interface FileListPreviewerProps {
  files?: FileInfo[];
}

const FileListPreviewer = ({ files }: FileListPreviewerProps) => {
  const t = useTranslations();
  const [visible, setVisible] = useState(false);
  const fileCount = useMemo(() => files?.length ?? 0, [files]);

  const handleOpen = useCallback(() => setVisible(true), []);
  const handleClose = useCallback(() => setVisible(false), []);

  return (
    <StyledListPreviewerWrapper>
      <IconButton onClick={handleOpen}>
        <Badge
          badgeContent={fileCount}
          max={999}
        >
          <FormatListBulletedRounded />
        </Badge>
      </IconButton>

      <Dialog
        title={t('Tools.FileListPreviewer')}
        open={visible}
        onClose={handleClose}
      >
        xxx
      </Dialog>
    </StyledListPreviewerWrapper>
  );
};

export default FileListPreviewer;
