import {
  FeaturedPlayListOutlined,
  MusicVideoOutlined,
  NoteOutlined,
  PanoramaOutlined,
  SmartDisplayOutlined,
} from '@mui/icons-material';
import { FileInfo } from '@shared';
import { AUDIO_REG, IMG_REG, TEXT_REG, VIDEO_REG } from '../constant';
import { StyledFileCard, StyledFileExt, StyledFileTitle } from '../style';

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
