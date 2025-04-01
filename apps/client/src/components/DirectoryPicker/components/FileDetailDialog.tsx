import Dialog from '#/components/Dialog';
import PosterImage from '#/components/PosterImage';
import { formatDate, formatFileSize } from '#/utils';
import { FileInfo } from '#pkgs/tools/traverseDirectories';
import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';
import {
  StyledFileDetailLabel,
  StyledFileDetailValue,
  StyledFileDetailWrapper,
} from '../style/file-detail-dialog';

interface FileDetailDialogProps {
  file: FileInfo;
  visible: boolean;
  onClose: () => void;
}

const FileDetailDialog = ({ file, visible, onClose }: FileDetailDialogProps) => {
  const t = useTranslations();

  const fileInfos: { label: string; value: string | undefined }[] = useMemo(() => {
    return [
      { label: t('File.Name'), value: file.name },
      { label: t('File.Path'), value: file.relativePath },
      { label: t('File.Size'), value: formatFileSize(file.size) },
      { label: t('File.Created'), value: formatDate(file.created) },
      { label: t('File.Updated'), value: formatDate(file.updated) },
    ];
  }, [file, t]);

  return (
    <Dialog
      open={visible}
      onClose={onClose}
      title={file.name}
      onlyClose
      dialogProps={{
        maxWidth: 'xs',
      }}
    >
      <StyledFileDetailWrapper>
        {fileInfos.map(info => (
          <React.Fragment key={info.label}>
            <StyledFileDetailLabel>
              {info.label}
              {t(':')}
            </StyledFileDetailLabel>
            <StyledFileDetailValue>{info.value || t('-')}</StyledFileDetailValue>
          </React.Fragment>
        ))}
      </StyledFileDetailWrapper>
      <Box sx={{ mt: '8px', height: '30vh' }}>
        <PosterImage file={file} />
      </Box>
    </Dialog>
  );
};

export default FileDetailDialog;
