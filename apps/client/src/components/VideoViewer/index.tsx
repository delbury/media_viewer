import { getFilePosterUrl } from '#/utils';
import { FileInfo } from '#pkgs/apis';
import { useMemo, useRef } from 'react';
import FixedModal, { FixedModalProps } from '../FixedModal';
import MediaControls, { MediaControlsInstance } from '../MediaControls';
import { StyledVideoWrapper } from './style';
import { useMediaSource } from './useMediaSource';

type VideoViewerProps = {
  file: FileInfo;
} & Omit<FixedModalProps, 'children'>;

const VideoViewer = ({ visible, onClose, file }: VideoViewerProps) => {
  const controlsRef = useRef<MediaControlsInstance>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // 链接
  const posterUrl = useMemo(() => getFilePosterUrl(file), [file]);

  // 自定义流媒体控制
  const { events: progressEvents } = useMediaSource({
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
        <MediaControls
          ref={controlsRef}
          mediaRef={videoRef}
        />
      }
    >
      <StyledVideoWrapper>
        <video
          ref={videoRef}
          poster={posterUrl}
          preload="metadata"
          playsInline
          {...progressEvents}
          onClick={controlsRef.current?.togglePlay}
        />
      </StyledVideoWrapper>
    </FixedModal>
  );
};

export default VideoViewer;
