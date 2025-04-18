import { useMediaPlayBtn } from '#/hooks/useMediaPlayBtn';
import { getFilePosterUrl, getFileSourceUrl, getVideoFileFallbackUrl } from '#/utils';
import { FileInfo } from '#pkgs/apis';
import { PauseRounded, PlayArrowRounded } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { ReactEventHandler, useCallback, useMemo, useRef, useState } from 'react';
import FixedModal, { FixedModalProps } from '../FixedModal';
import { StyledVideoToolbar, StyledVideoWrapper } from './style';

type VideoViewerProps = {
  file: FileInfo;
} & Omit<FixedModalProps, 'children'>;

const VideoViewer = ({ visible, onClose, file }: VideoViewerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  // 链接
  const posterUrl = useMemo(() => getFilePosterUrl(file), [file]);
  const sourceUrl = useMemo(() => getFileSourceUrl(file), [file]);
  // 视频状态控制
  const { isPlaying, toggle } = useMediaPlayBtn({ mediaRef: videoRef, noBtn: true });
  // 原始视频格式不支持播放时，降级播放地址
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);
  // 实机使用的资源地址
  const realSourceUrl = useMemo(() => fallbackUrl ?? sourceUrl, [fallbackUrl, sourceUrl]);

  // 视频报错事件
  const handleError = useCallback<ReactEventHandler<HTMLVideoElement>>(
    ev => {
      const err = (ev.target as HTMLVideoElement).error;
      // 判断错误类型，如果是浏览器不支持播放的视频，则降级为服务端转码
      if (
        err &&
        !fallbackUrl &&
        (err.code === err.MEDIA_ERR_DECODE || err.code === err.MEDIA_ERR_SRC_NOT_SUPPORTED)
      ) {
        const url = getVideoFileFallbackUrl(file);
        setFallbackUrl(url);
      }
    },
    [fallbackUrl, file]
  );

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
        {realSourceUrl && (
          <video
            ref={videoRef}
            poster={posterUrl}
            src={realSourceUrl}
            preload="metadata"
            playsInline
            controls
            onError={handleError}
          />
        )}
      </StyledVideoWrapper>
    </FixedModal>
  );
};

export default VideoViewer;
