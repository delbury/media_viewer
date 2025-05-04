import { useShortcut } from '#/hooks/useShortcut';
import { FileInfo } from '#pkgs/apis';
import {
  FullscreenExitRounded,
  FullscreenRounded,
  PauseRounded,
  PlayArrowRounded,
  SkipNextRounded,
  SkipPreviousRounded,
} from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { forwardRef, RefObject, useEffect, useImperativeHandle, useState } from 'react';
import { calcTimeRanges } from '../VideoViewer/util';
import AlertInfo from './components/AlertInfo';
import { MediaProgress } from './components/MediaProgress';
import ProgressInfo from './components/ProgressInfo';
import RateSetting from './components/RateSetting';
import RotateSetting from './components/RotateSetting';
import SubtitleSetting, { Subtitle } from './components/SubtitleSetting';
import VolumeSetting from './components/VolumeSetting';
import { useHandlers } from './hooks/useHandlers';
import { useMobileDrag } from './hooks/useMobileDrag';
import {
  StyledBtnsContainer,
  StyledBtnsGroup,
  StyledMediaControlsWrapper,
  StyledToolsRow,
} from './style';
import { bindEvent, bindEventOnce } from './util';

export interface MediaControlsInstance {
  togglePlay: () => void;
}

interface MediaControls {
  mediaRef: RefObject<HTMLMediaElement | null>;
  subtitles?: FileInfo['subtitles'];
  onPausedStateChange?: (paused: boolean) => void;
  onWaitingStateChange?: (waiting: boolean) => void;
  onNext?: () => void;
  onPrev?: () => void;
}

const MediaControls = forwardRef<MediaControlsInstance, MediaControls>(
  ({ mediaRef, subtitles, onPausedStateChange, onWaitingStateChange, onNext, onPrev }, ref) => {
    const [isPaused, setIsPaused] = useState(true);
    const [bufferRanges, setBufferRanges] = useState<[number, number][]>([]);
    const [videoDuration, setVideoDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [currentVolume, setCurrentVolume] = useState(0);
    const [isWaiting, setIsWaiting] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    // 播放速度
    const [currentRate, setCurrentRate] = useState(1);

    // 是否可全屏
    const [showFullScreenBtn, setShowFullScreenBtn] = useState(false);
    // 是否是 video
    const [isVideo, setIsVideo] = useState(false);
    // 是否展示前进/后退按钮
    const showPrevBtn = !!onPrev;
    const showNextBtn = !!onNext;

    // 当前字幕
    const [currentSubtitle, setCurrentSubtitle] = useState<Subtitle | undefined>(subtitles?.[0]);

    useEffect(() => {
      onPausedStateChange?.(isPaused);
    }, [isPaused, onPausedStateChange]);

    useEffect(() => {
      onWaitingStateChange?.(isWaiting);
    }, [isWaiting, onWaitingStateChange]);

    // handlers
    const {
      handleTogglePlay,
      handleToggleFullScreen,
      handleGoTo,
      handleBack,
      handleForward,
      handleVolumeChange,
      handleRateChange,
      handleGoBy,
    } = useHandlers({
      mediaRef,
      setIsPaused,
      setIsFullScreen,
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

    const { skipTimeText, currentDragDiffTime } = useMobileDrag({
      mediaRef,
      handleGoBy,
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

        // 双击播放
        const dblclickController = isVideoMedia
          ? bindEvent(elm, 'dblclick', () => {
              handleTogglePlay();
            })
          : null;

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
          dblclickController?.abort();
        };
      }
    }, [handleTogglePlay, mediaRef]);

    // 实例方法
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
        {/* 提示信息框 */}
        <AlertInfo message={skipTimeText} />

        {/* 进度条 */}
        <MediaProgress
          currentTime={currentTime}
          videoDuration={videoDuration}
          bufferRanges={bufferRanges}
          onGoto={handleGoTo}
          previewDiffTime={currentDragDiffTime}
        />

        <StyledToolsRow>
          <ProgressInfo
            currentTime={currentTime}
            videoDuration={videoDuration}
          />

          <StyledBtnsContainer>
            <StyledBtnsGroup>
              {/* 倍速 */}
              <RateSetting
                mediaRef={mediaRef}
                rate={currentRate}
                onRateChange={handleRateChange}
              />

              {/* 旋转 */}
              {isVideo && <RotateSetting mediaRef={mediaRef} />}
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
              {/* 字幕 */}
              {isVideo && (
                <SubtitleSetting
                  subtitle={currentSubtitle}
                  onSubtitleChange={setCurrentSubtitle}
                  subtitleOptions={subtitles}
                />
              )}

              {/* 静音 */}
              <VolumeSetting
                mediaRef={mediaRef}
                volume={currentVolume}
                onVolumeChange={handleVolumeChange}
                isMuted={isMuted}
              />

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
