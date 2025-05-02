import { useResizeObserver } from '#/hooks/useResizeObserver';
import { useRotateState } from '#/hooks/useRotateState';
import { useShortcut } from '#/hooks/useShortcut';
import { formatTime } from '#/utils';
import {
  CachedRounded,
  FullscreenExitRounded,
  FullscreenRounded,
  PauseRounded,
  PlayArrowRounded,
  RectangleRounded,
  RotateRightRounded,
  SkipNextRounded,
  SkipPreviousRounded,
  VolumeOffRounded,
  VolumeUpRounded,
} from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { forwardRef, RefObject, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { calcTimeRanges } from '../VideoViewer/util';
import { MediaProgress } from './MediaProgress';
import RateSetting from './RateSetting';
import RotateSetting from './RotateSetting';
import {
  StyledBtnsContainer,
  StyledBtnsGroup,
  StyledInfoDivider,
  StyledMediaControlsWrapper,
  StyledProgressInfo,
  StyledToolsRow,
} from './style';
import { useHandlers } from './useHandlers';
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
    const [currentRate, setCurrentRate] = useState(1);
    // 旋转值，用于旋转
    const { degree: currentDegree, setDegree: setCurrentDegree } = useRotateState({
      defaultDegree: 0,
      domRef: mediaRef,
    });

    // 是否可全屏
    const [showFullScreenBtn, setShowFullScreenBtn] = useState(false);
    // 是否是 video
    const [isVideo, setIsVideo] = useState(false);
    // 是否展示前进/后退按钮
    const showPrevBtn = !!onPrev;
    const showNextBtn = !!onNext;

    // 是否是未旋转状态，即为 360 的整数倍
    const isNotRotated = useMemo(() => currentDegree % 360 === 0, [currentDegree]);

    useEffect(() => {
      onPausedStateChange?.(isPaused);
    }, [isPaused, onPausedStateChange]);

    useEffect(() => {
      onWaitingStateChange?.(isWaiting);
    }, [isWaiting, onWaitingStateChange]);

    // 当前播放的进度信息，用于展示
    const ct = Math.floor(currentTime);
    const tt = Math.floor(videoDuration);
    const currentInfo = useMemo(() => formatTime(ct, tt >= 3600), [ct, tt]);
    const totalInfo = useMemo(() => formatTime(tt), [tt]);

    // 监听容器大小改变
    const { size: mediaContainerSize } = useResizeObserver({
      domRef: mediaRef,
      findDom: elm => elm.parentElement,
    });

    // 视频旋转
    useEffect(() => {
      const elm = mediaRef.current;
      if (!elm) return;

      // 旋转 90 度时，需要改变图片容器的大小
      const isVertical = currentDegree % 180 !== 0;

      elm.style.setProperty('transform', `rotate(${currentDegree}deg)`);
      if (isVertical && mediaContainerSize) {
        elm.style.setProperty('width', `${mediaContainerSize.height}px`);
        elm.style.setProperty('height', `${mediaContainerSize.width}px`);
      }

      return () => {
        elm.style.removeProperty('transform');
        elm.style.removeProperty('width');
        elm.style.removeProperty('height');
      };
    }, [currentDegree, mediaContainerSize, mediaRef]);

    // handlers
    const {
      handleTogglePlay,
      handleToggleRotate,
      handleToggleMute,
      handleToggleFullScreen,
      handleGoTo,
      handleBack,
      handleForward,
      handleVolumeChange,
      handleRateChange,
      handleSwitchRate,
      handleDegreeChange,
    } = useHandlers({
      mediaRef,
      setIsPaused,
      setIsFullScreen,
      currentDegree,
      setCurrentDegree,
    });

    // 快捷键
    useShortcut({
      onUpPressed: onPrev,
      onDownPressed: onNext,
      onLeftPressed: handleBack,
      onRightPressed: handleForward,
      onSpacePressed: handleTogglePlay,
      onEnterPressed: handleTogglePlay,
    });

    // 初始化
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
        setCurrentRate(elm.playbackRate);
        setVideoDuration(elm.duration);
        setCurrentTime(elm.currentTime);

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

        // 播放速率改变事件
        const ratechangeController = bindEvent(elm, 'ratechange', () => {
          setCurrentRate(elm.playbackRate);
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
          ratechangeController.abort();
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
          onGoto={handleGoTo}
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
              <RateSetting
                rate={currentRate}
                onRateChange={handleRateChange}
              >
                <IconButton onClick={handleSwitchRate}>
                  <RectangleRounded />
                </IconButton>
              </RateSetting>

              {/* 旋转 */}
              {isVideo && (
                <RotateSetting
                  degree={currentDegree}
                  onDegreeChange={handleDegreeChange}
                >
                  <IconButton onClick={handleToggleRotate}>
                    {isNotRotated ? <RotateRightRounded /> : <CachedRounded />}
                  </IconButton>
                </RotateSetting>
              )}
            </StyledBtnsGroup>

            <StyledBtnsGroup>
              {/* 上一个 */}
              {showPrevBtn && (
                <IconButton onClick={onPrev}>
                  <SkipPreviousRounded />
                </IconButton>
              )}

              {/* 播放 */}
              <IconButton onClick={handleTogglePlay}>
                {isPaused ? <PlayArrowRounded /> : <PauseRounded />}
              </IconButton>

              {/* 下一个 */}
              {showNextBtn && (
                <IconButton onClick={onNext}>
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
