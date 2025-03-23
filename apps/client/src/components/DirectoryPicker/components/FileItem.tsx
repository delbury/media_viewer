import { formatFileSize } from '@/utils';
import {
  FeaturedPlayListOutlined,
  MusicVideoOutlined,
  NoteOutlined,
  PanoramaOutlined,
  SmartDisplayOutlined,
} from '@mui/icons-material';
import { SvgIconOwnProps, Typography } from '@mui/material';
import { FileInfo } from '@shared';
import { AUDIO_REG, IMG_REG, TEXT_REG, VIDEO_REG } from '../constant';
import { StyledFileCard, StyledFileMoreInfo, StyledFileName, StyledFileTitle } from '../style';

const FileIcon = ({ ext, iconProps }: { ext: string; iconProps?: SvgIconOwnProps }) => {
  if (VIDEO_REG.test(ext)) {
    return <SmartDisplayOutlined {...iconProps} />;
  }
  if (AUDIO_REG.test(ext)) {
    return <MusicVideoOutlined {...iconProps} />;
  }
  if (IMG_REG.test(ext)) {
    return <PanoramaOutlined {...iconProps} />;
  }
  if (TEXT_REG.test(ext)) {
    return <FeaturedPlayListOutlined {...iconProps} />;
  }
  return <NoteOutlined {...iconProps} />;
};

interface FileItemProps {
  file: FileInfo;
}

const FileItem = ({ file }: FileItemProps) => {
  return (
    <StyledFileCard>
      <StyledFileTitle>
        <FileIcon
          ext={file.nameExt}
          iconProps={{ fontSize: 'inherit' }}
        />
        <StyledFileMoreInfo>
          <Typography
            variant="body2"
            sx={{ textTransform: 'uppercase' }}
          >
            {file.nameExt || '-'}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary' }}
          >
            {formatFileSize(file.size)}
          </Typography>
        </StyledFileMoreInfo>
      </StyledFileTitle>
      <StyledFileName>{file.name}</StyledFileName>
    </StyledFileCard>
  );
};

export default FileItem;
