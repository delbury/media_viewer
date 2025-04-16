import { useMediaPlayBtn } from '#/hooks/useMediaPlayBtn';
import { getFilePosterUrl, getFileSourceUrl } from '#/utils';
import { FileInfo } from '#pkgs/apis';
import { PauseRounded, PlayArrowRounded } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useMemo, useRef } from 'react';
import FixedModal, { FixedModalProps } from '../FixedModal';
import { StyledContentWrapper, StyledVideoToolbar, StyledVideoWrapper } from './style';

type VideoViewerProps = {
  file: FileInfo;
} & Omit<FixedModalProps, 'children'>;

const VideoViewer = ({ visible, onClose, file }: VideoViewerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  // 链接
  const posterUrl = useMemo(() => getFilePosterUrl(file), [file]);
  const sourceUrl = useMemo(() => getFileSourceUrl(file), [file]);

  const { isPlaying, toggle } = useMediaPlayBtn({ mediaRef: videoRef, noBtn: true });

  return (
    <FixedModal
      visible={visible}
      onClose={onClose}
      title={file.name}
      footerSlot={
        // 工具栏
        <StyledVideoToolbar>
          {/* 播放 / 暂停 */}
          <IconButton onClick={toggle}>
            {isPlaying ? <PauseRounded /> : <PlayArrowRounded />}
          </IconButton>
        </StyledVideoToolbar>
      }
    >
      <StyledContentWrapper>
        <StyledVideoWrapper>
          {sourceUrl && (
            <video
              ref={videoRef}
              poster={posterUrl}
              src={sourceUrl}
              playsInline
              // controls
            />
          )}
        </StyledVideoWrapper>
      </StyledContentWrapper>
    </FixedModal>
  );
};

export default VideoViewer;
