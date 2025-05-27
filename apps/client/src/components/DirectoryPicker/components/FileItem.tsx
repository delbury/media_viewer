import PosterImage from '#/components/PosterImage';
import { LazyLoadObserve } from '#/hooks/useLazyLoad';
import { formatFileSize, formatTime } from '#/utils';
import { FileInfo } from '#pkgs/apis';
import { SxProps, Theme } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import {
  StyledFileCardWrapper,
  StyledFileCoverWrapper,
  StyledFileMoreInfo,
  StyledFileMoreInfoMain,
  StyledFileMoreInfoSecondary,
  StyledFileName,
  StyledFileTitle,
} from '../style/file-item';

interface FileItemProps {
  file: FileInfo;
  onTitleClick?: (file: FileInfo) => void;
  sx?: SxProps<Theme>;
  refBindCallback?: LazyLoadObserve;
}

const FileItem = ({ file, onTitleClick, sx, refBindCallback }: FileItemProps) => {
  const t = useTranslations();
  const [enabled, setEnabled] = useState(false);

  const doLoad = useCallback(() => {
    setEnabled(true);
  }, []);

  return (
    <StyledFileCardWrapper
      sx={sx}
      ref={elm => refBindCallback?.(elm, doLoad)}
    >
      <StyledFileTitle onClick={() => onTitleClick?.(file)}>
        <StyledFileName>{file.name}</StyledFileName>

        <StyledFileMoreInfo>
          <StyledFileMoreInfoMain variant="body2">{file.nameExt || t('-')}</StyledFileMoreInfoMain>
          <StyledFileMoreInfoSecondary variant="body2">
            {formatFileSize(file.size)}
          </StyledFileMoreInfoSecondary>
          <StyledFileMoreInfoSecondary variant="body2">
            {formatTime(file.duration)}
          </StyledFileMoreInfoSecondary>
        </StyledFileMoreInfo>
      </StyledFileTitle>

      <StyledFileCoverWrapper>
        <PosterImage
          disabled={!enabled}
          file={file}
        />
      </StyledFileCoverWrapper>
    </StyledFileCardWrapper>
  );
};

FileItem.displayName = 'FileItem';

export default FileItem;
