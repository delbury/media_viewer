import { formatTime } from '#/utils';
import {
  DoubleArrowRounded,
  FullscreenExitRounded,
  FullscreenRounded,
  PauseRounded,
  PlayArrowRounded,
  SkipNextRounded,
  SkipPreviousRounded,
  VolumeOffRounded,
  VolumeUpRounded,
} from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { noop } from 'lodash-es';
import {
  forwardRef,
  RefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { calcTimeRanges } from '../VideoViewer/util';
import { MediaProgress } from './MediaProgress';
import {
  StyledBtnsContainer,
  StyledBtnsGroup,
  StyledInfoDivider,
  StyledMediaControlsWrapper,
  StyledProgressInfo,
  StyledToolsRow,
} from './style';
import VolumeSetting from './VolumeSetting';

// 绑定事件
const bindEvent = <T extends keyof HTMLMediaElementEventMap>(
  elm: HTMLMediaElement,
  eventName: T,
  cb: (ev: HTMLMediaElementEventMap[T]) => void
) => {
  const controller = new AbortController();
  elm.addEventListener(eventName, cb, { signal: controller.signal });
  return controller;
};
// 只执行一次的事件
const bindEventOnce = <T extends keyof HTMLMediaElementEventMap>(
  elm: HTMLMediaElement,
  eventName: T,
  cb: (ev: HTMLMediaElementEventMap[T]) => void
) => {
  elm.addEventListener(eventName, cb, { once: true });
};

export interface MediaControlsInstance {
  togglePlay: () => void;
}

interface MediaControls {
  mediaRef: RefObject<HTMLMediaElement | null>;
  onPausedStateChange?: (paused: boolean) => void;
  onWaitingStateChange?: (waiting: boolean) => void;
  onNext?: () => void;
  onPrev?: () => void;
}

const MediaControls = forwardRef<MediaControlsInstance, MediaControls>(
  ({ mediaRef, onPausedStateChange, onWaitingStateChange, onNext, onPrev }, ref) => {
    const [isPaused, setIsPaused] = useState(true);
    const [bufferRanges, setBufferRanges] = useState<[number, number][]>([]);
    const [videoDuration, setVideoDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [currentVolume, setCurrentVolume] = useState(0);
    const [isWaiting, setIsWaiting] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    // 是否可全屏
    const [showFullScreenBtn, setShowFullScreenBtn] = useState(false);
    // 是否是 video
    const [isVideo, setIsVideo] = useState(false);
    const isAudio = !isVideo;
    // 是否展示前进/后退按钮
    const showPrevBtn = !!onPrev;
    const showNextBtn = !!onNext;

    useEffect(() => {
      onPausedStateChange?.(isPaused);
    }, [isPaused, onPausedStateChange]);

    useEffect(() => {
      onWaitingStateChange?.(isWaiting);
    }, [isWaiting, onWaitingStateChange]);

    // 当前播放的进度信息，用于展示
    const ct = Math.floor(currentTime);
    const currentInfo = useMemo(() => formatTime(ct), [ct]);
    const tt = Math.floor(videoDuration);
    const totalInfo = useMemo(() => formatTime(tt), [tt]);

    // 播放切换
    const handleTogglePlay = useCallback(() => {
      if (!mediaRef.current) return;
      if (mediaRef.current.paused) {
        mediaRef.current.play().catch(noop);
        setIsPaused(false);
      } else {
        mediaRef.current.pause();
        setIsPaused(true);
      }
    }, [mediaRef]);

    // 静音切换
    const handleToggleMute = useCallback(() => {
      if (!mediaRef.current) return;
      mediaRef.current.muted = !mediaRef.current.muted;
    }, [mediaRef]);

    // 全屏切换
    const handleToggleFullScreen = useCallback(() => {
      setIsFullScreen(v => !v);
    }, []);

    // 跳转到对应的进度条时刻
    const handleGoto = useCallback(
      (time: number) => {
        if (!mediaRef.current) return;
        mediaRef.current.currentTime = time;
      },
      [mediaRef]
    );

    // 改变音量
    const handleVolumeChange = useCallback(
      (v: number) => {
        if (!mediaRef.current) return;
        mediaRef.current.volume = v;
      },
      [mediaRef]
    );

    useEffect(() => {
      const elm = mediaRef.current;
      if (elm) {
        // 初始化状态
        setIsPaused(elm.paused);
        setIsMuted(elm.muted);
        setCurrentVolume(elm.volume);
        const isVideoMedia = elm instanceof HTMLVideoElement;
        setShowFullScreenBtn(isVideoMedia && document.fullscreenEnabled);
        setIsVideo(isVideoMedia);

        // 播放事件
        const playController = bindEvent(elm, 'play', () => {
          setIsPaused(false);
        });

        // 暂停事件
        const pauseController = bindEvent(elm, 'pause', () => {
          setIsPaused(true);
        });

        // 加载事件
        const progressController = bindEvent(elm, 'progress', () => {
          const ranges = calcTimeRanges(elm.buffered);
          setBufferRanges(ranges);
        });

        // 加载第一帧完成
        bindEventOnce(elm, 'loadeddata', () => {
          const ranges = calcTimeRanges(elm.buffered);
          setBufferRanges(ranges);
          setVideoDuration(elm.duration);
        });

        // 播放时间改变事件
        const timeupdateController = bindEvent(elm, 'timeupdate', () => {
          setCurrentTime(elm.currentTime);
        });

        // 音量改变事件
        const volumechangeController = bindEvent(elm, 'volumechange', () => {
          setIsMuted(elm.muted || !elm.volume);
          setCurrentVolume(elm.volume);
        });

        // 等待事件
        const waitingController = bindEvent(elm, 'waiting', () => {
          setIsWaiting(true);
        });

        // 可播放事件
        const canplayController = bindEvent(elm, 'canplay', () => {
          setIsWaiting(false);
        });

        return () => {
          playController.abort();
          pauseController.abort();
          progressController.abort();
          timeupdateController.abort();
          volumechangeController.abort();
          waitingController.abort();
          canplayController.abort();
        };
      }
    }, [mediaRef]);

    useImperativeHandle(
      ref,
      () => ({
        togglePlay: () => {
          const elm = mediaRef.current;
          if (!elm) return;
          if (elm.paused) elm.play();
          else elm.pause();
        },
      }),
      [mediaRef]
    );

    return (
      <StyledMediaControlsWrapper>
        {/* 进度条 */}
        <MediaProgress
          currentTime={currentTime}
          videoDuration={videoDuration}
          bufferRanges={bufferRanges}
          onGoto={handleGoto}
        />

        <StyledToolsRow>
          <StyledProgressInfo variant="body2">
            {currentInfo}
            <StyledInfoDivider>/</StyledInfoDivider>
            {totalInfo}
          </StyledProgressInfo>

          <StyledBtnsContainer>
            <StyledBtnsGroup>
              {/* 倍速 */}
              <IconButton>
                <DoubleArrowRounded />
              </IconButton>

              {/* 旋转 */}
              {/* 逆时针旋转 */}
              {/* {isVideo && (
                <IconButton>
                  <RotateLeftRounded />
                </IconButton>
              )} */}

              {/* 顺时针旋转 */}
              {/* {isVideo && (
                <IconButton>
                  <RotateRightRounded />
                </IconButton>
              )} */}
            </StyledBtnsGroup>

            <StyledBtnsGroup>
              {/* 上一个 */}
              {showPrevBtn && (
                <IconButton>
                  <SkipPreviousRounded />
                </IconButton>
              )}

              {/* 播放 */}
              <IconButton onClick={handleTogglePlay}>
                {isPaused ? <PlayArrowRounded /> : <PauseRounded />}
              </IconButton>

              {/* 下一个 */}
              {showNextBtn && (
                <IconButton>
                  <SkipNextRounded />
                </IconButton>
              )}
            </StyledBtnsGroup>

            <StyledBtnsGroup>
              {/* 静音 */}
              <VolumeSetting
                volume={currentVolume}
                onVolumeChange={handleVolumeChange}
              >
                <IconButton onClick={handleToggleMute}>
                  {isMuted ? <VolumeOffRounded /> : <VolumeUpRounded />}
                </IconButton>
              </VolumeSetting>

              {/* 全屏 */}
              {showFullScreenBtn && (
                <IconButton onClick={handleToggleFullScreen}>
                  {isFullScreen ? <FullscreenExitRounded /> : <FullscreenRounded />}
                </IconButton>
              )}
            </StyledBtnsGroup>
          </StyledBtnsContainer>
        </StyledToolsRow>
      </StyledMediaControlsWrapper>
    );
  }
);

MediaControls.displayName = 'MediaControls';

export default MediaControls;
