import { useFileTitle } from '#/hooks/useFileTitle';
import { getFilePosterUrl } from '#/utils';
import { FileInfo } from '#pkgs/apis';
import { useEffect, useMemo, useRef, useState } from 'react';
import FixedModal, { FixedModalProps } from '../FixedModal';
import Loading from '../Loading';
import MediaControls from '../MediaControls';
import { StyledLoadingWrapper, StyledVideoWrapper } from './style';
import { useMediaSource } from './useMediaSource';

type VideoViewerProps = {
  file?: FileInfo;
  isList?: boolean;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  isRandomPlay?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  onToggleRandom?: () => void;
  onTitleClick?: () => void;
  headerLeftSlot?: React.ReactNode;
} & Omit<FixedModalProps, 'children'>;

const VideoViewer = ({
  visible,
  onClose,
  file,
  nextDisabled,
  prevDisabled,
  isList,
  isRandomPlay,
  onNext,
  onPrev,
  onToggleRandom,
  onTitleClick,
  headerLeftSlot,
}: VideoViewerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  // 链接
  const posterUrl = useMemo(() => getFilePosterUrl(file), [file]);
  // 等待中
  const [isWaiting, setIsWaiting] = useState(false);
  // 强制转码
  const [forceSource, setForceSource] = useState(false);
  useEffect(() => setForceSource(false), [file]);

  // 自定义流媒体控制
  const {
    events: progressEvents,
    isRawSource,
    isForced,
  } = useMediaSource({
    file,
    mediaRef: videoRef,
    forceSource,
  });

  // 标题
  const { title, secondaryTitle } = useFileTitle({ file });

  return (
    <FixedModal
      visible={visible}
      onClose={onClose}
      onTitleClick={onTitleClick}
      title={title}
      secondaryTitle={secondaryTitle}
      headerLeftSlot={headerLeftSlot}
      footerSlot={
        // 工具栏
        <MediaControls
          mediaRef={videoRef}
          onWaitingStateChange={setIsWaiting}
          file={file}
          nextDisabled={nextDisabled}
          prevDisabled={prevDisabled}
          isList={isList}
          isRandomPlay={isRandomPlay}
          onNext={onNext}
          onPrev={onPrev}
          onToggleRandom={onToggleRandom}
          useSource={isForced}
          isRawSource={isRawSource}
          onUseSourceChange={setForceSource}
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
        />

        {isWaiting && (
          <StyledLoadingWrapper>
            <Loading
              size="75%"
              lazy
            />
          </StyledLoadingWrapper>
        )}
      </StyledVideoWrapper>
    </FixedModal>
  );
};

export default VideoViewer;
