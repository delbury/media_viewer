import { formatFileSize } from '@/utils';
import {
  FeaturedPlayListOutlined,
  MusicVideoOutlined,
  NoteOutlined,
  PanoramaOutlined,
  SmartDisplayOutlined,
} from '@mui/icons-material';
import { SvgIconOwnProps } from '@mui/material';
import { FileInfo } from '@shared';
import { AUDIO_REG, IMG_REG, TEXT_REG, VIDEO_REG } from '../constant';
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
  if (VIDEO_REG.test(ext)) {
    return <SmartDisplayOutlined {...iconProps} />;
  }
  if (AUDIO_REG.test(ext)) {
    return (
      <MusicVideoOutlined
        viewBox="0 -1.5 24 27"
        {...iconProps}
      />
    );
  }
  if (IMG_REG.test(ext)) {
    return <PanoramaOutlined {...iconProps} />;
  }
  if (TEXT_REG.test(ext)) {
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
}

const FileItem = ({ file }: FileItemProps) => {
  return (
    <StyledFileCardWrapper>
      <StyledFileTitle>
        <StyledFileName>{file.name}</StyledFileName>

        <StyledFileMoreInfo>
          <StyledFileMoreInfoExt variant="body2">{file.nameExt || '-'}</StyledFileMoreInfoExt>
          <StyledFileMoreInfoSize variant="body2">{formatFileSize(file.size)}</StyledFileMoreInfoSize>
        </StyledFileMoreInfo>
      </StyledFileTitle>

      <StyledFilePosterWrapper>
        <FileIcon
          ext={file.nameExt}
          iconProps={{ sx: { height: '100%', width: '100%' } }}
        />
      </StyledFilePosterWrapper>
    </StyledFileCardWrapper>
  );
};

export default FileItem;
