import { getFilePosterUrl } from '#/utils';
import { FileInfo } from '#pkgs/apis';
import { useMemo, useRef, useState } from 'react';
import FixedModal, { FixedModalProps } from '../FixedModal';
import Loading from '../Loading';
import MediaControls, { MediaControlsInstance } from '../MediaControls';
import { StyledLoadingWrapper, StyledVideoWrapper } from './style';
import { useMediaSource } from './useMediaSource';

type VideoViewerProps = {
  file: FileInfo;
} & Omit<FixedModalProps, 'children'>;

const VideoViewer = ({ visible, onClose, file }: VideoViewerProps) => {
  const controlsRef = useRef<MediaControlsInstance>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // 链接
  const posterUrl = useMemo(() => getFilePosterUrl(file), [file]);
  // 等待中
  const [isWaiting, setIsWaiting] = useState(false);

  // 自定义流媒体控制
  const { isLoading, events: progressEvents } = useMediaSource({
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
          onWaitingStateChange={setIsWaiting}
        />
      }
    >
      <StyledVideoWrapper>
        <video
          ref={videoRef}
          poster={posterUrl}
          preload="metadata"
          playsInline
          // controls
          {...progressEvents}
          onClick={controlsRef.current?.togglePlay}
        />

        {(isWaiting || isLoading) && (
          <StyledLoadingWrapper>
            <Loading size="75%" />
          </StyledLoadingWrapper>
        )}
      </StyledVideoWrapper>
    </FixedModal>
  );
};

export default VideoViewer;
