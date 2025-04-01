import PosterImage from '#/components/PosterImage';
import { LazyLoadObserve } from '#/hooks/useLazyLoad';
import { formatFileSize } from '#/utils';
import { FileInfo } from '#pkgs/shared';
import { detectFileType } from '#pkgs/tools/common';
import {
  BrowserNotSupportedOutlined,
  FeaturedPlayListOutlined,
  MusicVideoOutlined,
  NoteOutlined,
  PanoramaOutlined,
  SmartDisplayOutlined,
} from '@mui/icons-material';
import { Box, CircularProgress, SvgIconOwnProps, SxProps, Theme } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import {
  StyledFileCardWrapper,
  StyledFileMoreInfo,
  StyledFileMoreInfoExt,
  StyledFileMoreInfoSize,
  StyledFileName,
  StyledFileTitle,
} from '../style/file-item';
import { StyledFilePosterLoading, StyledFilePosterWrapper } from '../style/file-item-list';

export const FileIcon = ({
  ext,
  iconProps,
  isError,
}: {
  ext: string;
  iconProps?: SvgIconOwnProps;
  isError: boolean;
}) => {
  if (isError) {
    return (
      <BrowserNotSupportedOutlined
        {...iconProps}
        sx={{
          ...iconProps?.sx,
          color: 'error.dark',
          cursor: 'pointer',
        }}
      />
    );
  }

  const fileType = detectFileType(ext);

  if (fileType === 'video') {
    return <SmartDisplayOutlined {...iconProps} />;
  }
  if (fileType === 'audio') {
    return (
      <MusicVideoOutlined
        viewBox="0 -1.5 24 27"
        {...iconProps}
      />
    );
  }
  if (fileType === 'image') {
    return <PanoramaOutlined {...iconProps} />;
  }
  if (fileType === 'text') {
    return (
      <FeaturedPlayListOutlined
        viewBox="0 -1.5 24 27"
        {...iconProps}
      />
    );
  }
  return <NoteOutlined {...iconProps} />;
};

interface FileItemProps {
  file: FileInfo;
  onTitleClick?: (file: FileInfo) => void;
  sx?: SxProps<Theme>;
  refBindCallback?: LazyLoadObserve;
}

const FileItem = ({ file, onTitleClick, sx, refBindCallback }: FileItemProps) => {
  const t = useTranslations();
  const [posterUrlEnabled, setPosterUrlEnabled] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const showImage = posterUrlEnabled && (!isError || isLoading);

  const doLoad = useCallback(() => {
    if (file.fileType !== 'image') return;

    setPosterUrlEnabled(true);
  }, [file.fileType, setPosterUrlEnabled]);

  const handleIconClick = () => {
    if (file.fileType !== 'image') return;

    setIsError(false);
    setIsLoading(true);
  };

  return (
    <StyledFileCardWrapper
      sx={sx}
      ref={elm => refBindCallback?.(elm, doLoad)}
    >
      <StyledFileTitle onClick={() => onTitleClick?.(file)}>
        <StyledFileName>{file.name}</StyledFileName>

        <StyledFileMoreInfo>
          <StyledFileMoreInfoExt variant="body2">{file.nameExt || t('-')}</StyledFileMoreInfoExt>
          <StyledFileMoreInfoSize variant="body2">
            {formatFileSize(file.size)}
          </StyledFileMoreInfoSize>
        </StyledFileMoreInfo>
      </StyledFileTitle>

      <StyledFilePosterWrapper>
        {isLoading && !!posterUrlEnabled && (
          <StyledFilePosterLoading>
            <CircularProgress
              sx={{ width: '100%', height: '100%', color: 'text.secondary' }}
              thickness={6}
            />
          </StyledFilePosterLoading>
        )}

        {showImage ? (
          // 在这里使用 next/image 会发送两次请求，很奇怪，回退到原生 img 就正常请求一次
          <PosterImage
            disabled={!posterUrlEnabled}
            file={file}
            isLoading={isLoading}
            onError={() => setIsError(true)}
            onLoad={() => setIsLoading(false)}
          />
        ) : (
          <Box
            sx={{ height: '100%', width: '100%' }}
            onClick={handleIconClick}
          >
            <FileIcon
              isError={isError}
              ext={file.nameExt}
              iconProps={{ sx: { height: '100%', width: '100%', color: 'text.secondary' } }}
            />
          </Box>
        )}
      </StyledFilePosterWrapper>
    </StyledFileCardWrapper>
  );
};

FileItem.displayName = 'FileItem';

export default FileItem;
