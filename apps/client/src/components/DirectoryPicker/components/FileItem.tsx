import { formatFileSize } from '@/utils';
import {
  FeaturedPlayListOutlined,
  MusicVideoOutlined,
  NoteOutlined,
  PanoramaOutlined,
  SmartDisplayOutlined,
} from '@mui/icons-material';
import { SvgIconOwnProps, SxProps, Theme } from '@mui/material';
import { FileInfo } from '@shared';
import { detectFileType } from '@tools/utils';
import { useTranslations } from 'next-intl';
import {
  StyledFileCardWrapper,
  StyledFileMoreInfo,
  StyledFileMoreInfoExt,
  StyledFileMoreInfoSize,
  StyledFileName,
  StyledFileTitle,
} from '../style/file-item';
import { StyledFilePosterWrapper } from '../style/file-item-list';

export const FileIcon = ({ ext, iconProps }: { ext: string; iconProps?: SvgIconOwnProps }) => {
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
}

const FileItem = ({ file, onTitleClick, sx }: FileItemProps) => {
  const t = useTranslations();

  return (
    <StyledFileCardWrapper sx={sx}>
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
        <FileIcon
          ext={file.nameExt}
          iconProps={{ sx: { height: '100%', width: '100%', color: 'text.secondary' } }}
        />
      </StyledFilePosterWrapper>
    </StyledFileCardWrapper>
  );
};

export default FileItem;
