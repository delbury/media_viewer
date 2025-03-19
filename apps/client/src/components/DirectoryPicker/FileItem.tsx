import { FileInfo } from '@shared';
import { StyledFileCard, StyledFileExt, StyledFileTitle } from './style';
import {
  MusicVideoOutlined,
  SmartDisplayOutlined,
  PanoramaOutlined,
  FeaturedPlayListOutlined,
  NoteOutlined,
} from '@mui/icons-material';

const IMG_REG = /\.(jpg|png|jepg|webp|bmp|gif|svg|raw|tiff|tif|ico)/i;
const AUDIO_REG = /\.(mp3|wav|aac|flac|m4a|wma|ogg)/i;
const VIDEO_REG = /\.(mp4|mkv|avi|mov|wmv|flv|mpg|mpeg|webm|3gp|ts)/i;
const TEXT_REG = /\.(pdf|txt)/i;
const FileIcon = ({ ext }: { ext: string }) => {
  if (VIDEO_REG.test(ext)) {
    return <SmartDisplayOutlined />;
  }
  if (AUDIO_REG.test(ext)) {
    return <MusicVideoOutlined />;
  }
  if (IMG_REG.test(ext)) {
    return <PanoramaOutlined />;
  }
  if (TEXT_REG.test(ext)) {
    return <FeaturedPlayListOutlined />;
  }
  return <NoteOutlined />;
};

interface FileItemProps {
  file: FileInfo;
}

const FileItem = ({ file }: FileItemProps) => {
  return (
    <StyledFileCard>
      <StyledFileExt>
        <FileIcon ext={file.nameExt} />
        <span>{file.nameExt || '-'}</span>
      </StyledFileExt>
      <StyledFileTitle>{file.name}</StyledFileTitle>
    </StyledFileCard>
  );
};

export default FileItem;
