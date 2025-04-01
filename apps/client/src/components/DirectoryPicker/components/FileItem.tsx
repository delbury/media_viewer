import PosterImage from '#/components/PosterImage';
import { LazyLoadObserve } from '#/hooks/useLazyLoad';
import { formatFileSize } from '#/utils';
import { FileInfo } from '#pkgs/shared';
import { detectFileType } from '#pkgs/tools/common';
import {
  FeaturedPlayListOutlined,
  MusicVideoOutlined,
  NoteOutlined,
  PanoramaOutlined,
  SmartDisplayOutlined,
} from '@mui/icons-material';
import { Box, SvgIconOwnProps, SxProps, Theme } from '@mui/material';
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
import { StyledFileCoverWrapper } from '../style/file-item-list';

export const FileIcon = ({
  ext,
  iconProps,
  // isError,
}: {
  ext: string;
  iconProps?: SvgIconOwnProps;
  // isError: boolean;
}) => {
  // if (isError) {
  //   return (
  //     <BrowserNotSupportedOutlined
  //       {...iconProps}
  //       sx={{
  //         ...iconProps?.sx,
  //         color: 'error.dark',
  //         cursor: 'pointer',
  //       }}
  //     />
  //   );
  // }

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
  const showImage = !!posterUrlEnabled;

  const doLoad = useCallback(() => {
    if (file.fileType !== 'image') return;

    setPosterUrlEnabled(true);
  }, [file.fileType, setPosterUrlEnabled]);

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

      <StyledFileCoverWrapper>
        {showImage ? (
          <PosterImage
            disabled={!posterUrlEnabled}
            file={file}
          />
        ) : (
          <Box sx={{ height: '100%', width: '100%' }}>
            <FileIcon
              // isError={isError}
              ext={file.nameExt}
              iconProps={{ sx: { height: '100%', width: '100%', color: 'text.secondary' } }}
            />
          </Box>
        )}
      </StyledFileCoverWrapper>
    </StyledFileCardWrapper>
  );
};

FileItem.displayName = 'FileItem';

export default FileItem;
