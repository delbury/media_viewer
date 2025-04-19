import { useMediaPlayBtn } from '#/hooks/useMediaPlayBtn';
import { getFilePosterUrl } from '#/utils';
import { FileInfo } from '#pkgs/apis';
import { logError } from '#pkgs/tools/common';
import { PauseRounded, PlayArrowRounded } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { ReactEventHandler, useCallback, useMemo, useRef, useState } from 'react';
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
  const { isPlaying, toggle } = useMediaPlayBtn({ mediaRef: videoRef, noBtn: true });
  // 原始视频格式不支持播放时，降级播放地址
  const [fallbackEnabled, setFallbackEnabled] = useState(false);
  // 实机使用的资源地址

  // 自定义流媒体控制
  useMediaSource({
    file,
    mediaRef: videoRef,
    enabled: fallbackEnabled,
  });

  // 视频报错事件
  const handleError = useCallback<ReactEventHandler<HTMLVideoElement>>(
    ev => {
      const err = (ev.target as HTMLVideoElement).error;
      // 判断错误类型，如果是浏览器不支持播放的视频，则降级为服务端转码
      if (
        err &&
        !fallbackEnabled &&
        (err.code === err.MEDIA_ERR_DECODE || err.code === err.MEDIA_ERR_SRC_NOT_SUPPORTED)
      ) {
        setFallbackEnabled(true);
      } else {
        logError(err);
      }
    },
    [fallbackEnabled]
  );

  // 视频可播放事件，防止只有音频可以播放，视频无法播放
  const handleCanplay = useCallback<ReactEventHandler<HTMLVideoElement>>(ev => {
    const target = ev.target as HTMLVideoElement;
    if (!target.videoHeight && !target.videoWidth) {
      setFallbackEnabled(true);
    }
  }, []);

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
            key={`${fallbackEnabled}`}
            ref={videoRef}
            poster={posterUrl}
            // src={realSourceUrl}
            preload="metadata"
            playsInline
            controls
            onError={handleError}
            onCanPlay={handleCanplay}
          />
        }
      </StyledVideoWrapper>
    </FixedModal>
  );
};

export default VideoViewer;
