import Dialog from '#/components/Dialog';
import PosterImage from '#/components/PosterImage';
import { formatDate, formatFileSize } from '#/utils';
import { FileInfo } from '#pkgs/tools/traverseDirectories';
import { LoopOutlined } from '@mui/icons-material';
import { Box, IconButton } from '@mui/material';
import { useTranslations } from 'next-intl';
import React, { useMemo, useState } from 'react';
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
  const [imgKey, setImgKey] = useState(false);

  const fileInfos: { label: string; value: string | undefined }[] = useMemo(() => {
    return [
      { label: t('File.Name'), value: file.name },
      { label: t('File.Path'), value: file.relativePath },
      { label: t('File.Size'), value: formatFileSize(file.size) },
      { label: t('File.Created'), value: formatDate(file.created) },
      { label: t('File.Updated'), value: formatDate(file.updated) },
    ];
  }, [file, t]);

  const showImage = useMemo(() => {
    return file.fileType === 'image';
  }, [file.fileType]);

  return (
    <Dialog
      open={visible}
      onClose={onClose}
      title={file.name}
      onlyClose
      dialogProps={{
        maxWidth: 'xs',
      }}
      leftFooterSlot={
        showImage && (
          <IconButton
            onClick={() => {
              // 刷新图片
              setImgKey(v => !v);
            }}
          >
            <LoopOutlined />
          </IconButton>
        )
      }
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
      {showImage && (
        <Box sx={{ mt: '8px', height: '30vh' }}>
          <PosterImage
            file={file}
            key={imgKey.toString()}
          />
        </Box>
      )}
    </Dialog>
  );
};

export default FileDetailDialog;
