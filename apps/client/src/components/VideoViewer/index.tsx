import { useMediaState } from '#/hooks/useMediaState';
import { getFilePosterUrl } from '#/utils';
import { FileInfo } from '#pkgs/apis';
import { PauseRounded, PlayArrowRounded } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useMemo, useRef } from 'react';
import FixedModal, { FixedModalProps } from '../FixedModal';
import { StyledVideoToolbar, StyledVideoWrapper } from './style';
import { useMediaSource } from './useMediaSource';

type VideoViewerProps = {
  file: FileInfo;
} & Omit<FixedModalProps, 'children'>;

const VideoViewer = ({ visible, onClose, file }: VideoViewerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  // 链接
  const posterUrl = useMemo(() => getFilePosterUrl(file), [file]);
  // 视频状态控制
  const { isPlaying, toggle, events: stateEvents } = useMediaState({ mediaRef: videoRef });

  // 自定义流媒体控制
  const { isCanplay, events: progressEvents } = useMediaSource({
    file,
    mediaRef: videoRef,
  });

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
      <StyledVideoWrapper>
        {
          <video
            ref={videoRef}
            poster={posterUrl}
            // src={realSourceUrl}
            preload="metadata"
            playsInline
            controls={isCanplay}
            {...stateEvents}
            {...progressEvents}
          />
        }
      </StyledVideoWrapper>
    </FixedModal>
  );
};

export default VideoViewer;
