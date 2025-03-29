import { LazyLoadObserve } from '#/hooks/useLazyLoad';
import { API_BASE_URL } from '#/request';
import { formatFileSize } from '#/utils';
import { joinUrlWithQueryString } from '#pkgs/apis';
import { FileInfo } from '#pkgs/shared';
import { detectFileType } from '#pkgs/tools/utils';
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
import Image from 'next/image';
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
  const [posterUrl, setPosterUrl] = useState<string>('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const showImage = posterUrl && (!isError || isLoading);

  const doLoad = useCallback(() => {
    if (file.fileType !== 'image') return;

    const url = joinUrlWithQueryString(
      'filePoster',
      {
        basePathIndex: file.basePathIndex,
        fullPath: file.fullPath,
      },
      API_BASE_URL
    );

    setPosterUrl(url);
  }, [file.basePathIndex, file.fullPath, file.fileType]);

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
        {isLoading && !!posterUrl && (
          <StyledFilePosterLoading>
            <CircularProgress
              sx={{ width: '100%', height: '100%', color: 'text.secondary' }}
              thickness={6}
            />
          </StyledFilePosterLoading>
        )}

        {showImage ? (
          <Image
            src={posterUrl}
            alt={file.name}
            fill
            sizes="100%"
            style={{
              objectFit: 'contain',
              visibility: isLoading ? 'hidden' : 'visible',
            }}
            onError={() => {
              setIsError(true);
              setIsLoading(false);
            }}
            onLoad={() => {
              setIsLoading(false);
            }}
            loading="eager"
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
