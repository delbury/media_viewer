import Dialog from '#/components/Dialog';
import PosterImage from '#/components/PosterImage';
import { formatDate, formatFileSize } from '#/utils';
import { FullFileType } from '#pkgs/shared';
import { FileInfo } from '#pkgs/tools/traverseDirectories';
import { LoopOutlined, PhotoOutlined, PlayCircleOutlineRounded } from '@mui/icons-material';
import { IconButton, SxProps, Theme } from '@mui/material';
import { useTranslations } from 'next-intl';
import React, { useMemo, useState } from 'react';
import { FULL_FILE_FILTER_MAP } from '../constant';
import {
  StyledFileDetailLabel,
  StyledFileDetailValue,
  StyledFileDetailWrapper,
  StyledFilePosterInner,
  StyledFilePosterWrapper,
} from '../style/file-detail-dialog';

const getTitleIcon = (fileType: FullFileType, sx?: SxProps<Theme>) => {
  if (fileType === 'video' || fileType === 'audio') {
    return <PlayCircleOutlineRounded sx={sx} />;
  } else if (fileType === 'image') {
    return <PhotoOutlined sx={sx} />;
  }
  return null;
};

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
      { label: t('File.Type'), value: t(FULL_FILE_FILTER_MAP[file.fileType]) },
      { label: t('File.Size'), value: formatFileSize(file.size) },
      { label: t('File.Created'), value: formatDate(file.created) },
      { label: t('File.Updated'), value: formatDate(file.updated) },
    ];
  }, [file, t]);

  const showImage = useMemo(() => {
    return file.fileType === 'image' || file.fileType === 'video' || file.fileType === 'audio';
  }, [file.fileType]);

  return (
    <Dialog
      open={visible}
      onClose={onClose}
      title={
        <>
          {getTitleIcon(file.fileType, { marginInlineEnd: '8px' })}
          {file.name}
        </>
      }
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
        <StyledFilePosterWrapper>
          <StyledFilePosterInner>
            <PosterImage
              file={file}
              key={imgKey.toString()}
              viewerAutoMount
            />
          </StyledFilePosterInner>
        </StyledFilePosterWrapper>
      )}
    </Dialog>
  );
};

export default FileDetailDialog;
