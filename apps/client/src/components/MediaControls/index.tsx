import { useShortcut } from '#/hooks/useShortcut';
import { h5Max } from '#/style/device';
import { FileInfo } from '#pkgs/apis';
import {
  FormatListNumberedRtlRounded,
  MoreVertRounded,
  PauseRounded,
  PlayArrowRounded,
  ShuffleRounded,
  SkipNextRounded,
  SkipPreviousRounded,
} from '@mui/icons-material';
import { IconButton, useMediaQuery } from '@mui/material';
import {
  forwardRef,
  RefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import TooltipSetting from '../TooltipSetting';
import AlertInfo from './components/AlertInfo';
import FullscreenSetting from './components/FullscreenSetting';
import { MediaProgress } from './components/MediaProgress';
import ProgressInfo from './components/ProgressInfo';
import RateSetting from './components/RateSetting';
import RotateSetting from './components/RotateSetting';
import SubtitleSetting from './components/SubtitleSetting';
import VolumeSetting from './components/VolumeSetting';
import { useHandlers } from './hooks/useHandlers';
import { useMobileDrag } from './hooks/useMobileDrag';
import {
  StyledBtnsContainer,
  StyledBtnsGroup,
  StyledMediaControlsWrapper,
  StyledToolsRow,
} from './style';
import { bindEvent } from './util';

export interface MediaControlsInstance {
  togglePlay: () => void;
}

interface MediaControls {
  mediaRef: RefObject<HTMLMediaElement | null>;
  file?: FileInfo;
  onPausedStateChange?: (paused: boolean) => void;
  onWaitingStateChange?: (waiting: boolean) => void;
  onNext?: () => void;
  onPrev?: () => void;
  isList?: boolean;
  firstDisabled?: boolean;
  lastDisabled?: boolean;
  isRandomPlay?: boolean;
  onToggleRandom?: () => void;
}

const MediaControls = forwardRef<MediaControlsInstance, MediaControls>(
  (
    {
      file,
      mediaRef,
      onPausedStateChange,
      onWaitingStateChange,
      onNext,
      onPrev,
      isList,
      onToggleRandom,
      isRandomPlay,
      firstDisabled,
      lastDisabled,
    },
    ref
  ) => {
    const [isPaused, setIsPaused] = useState(true);
    const [isWaiting, setIsWaiting] = useState(false);
    const [videoDuration, setVideoDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    // 是否是 h5
    const isH5 = useMediaQuery(h5Max);

    // 是否是 video
    const [isVideo, setIsVideo] = useState(false);

    // 隐藏部分按钮到更多中
    const showMore = isH5 && isVideo;
    const [moreOpen, setMoreOpen] = useState(false);
    const handleToggleMoreOpen = useCallback(() => setMoreOpen(v => !v), []);

    useEffect(() => {
      onPausedStateChange?.(isPaused);
    }, [isPaused, onPausedStateChange]);

    useEffect(() => {
      onWaitingStateChange?.(isWaiting);
    }, [isWaiting, onWaitingStateChange]);

    const subtitles = useMemo(() => file?.subtitles, [file]);

    // handlers
    const { handleTogglePlay, handleBack, handleForward, handleGoBy, handleNext, handlePrev } =
      useHandlers({
        mediaRef,
        isPaused,
        onPrev,
        onNext,
      });

    // 快捷键
    useShortcut({
      onUpPressed: handlePrev,
      onDownPressed: handleNext,
      onLeftPressed: handleBack,
      onRightPressed: handleForward,
      onSpacePressed: handleTogglePlay,
      onEnterPressed: handleTogglePlay,
    });

    // 移动端，手势拖拽的操作
    const { skipTimeText, currentDragDiffTime } = useMobileDrag({
      mediaRef,
      handleGoBy,
    });

    // 在模拟双击播放时，记录第一次播放
    const videoFirstClicked = useRef(false);

    // 初始化
    useEffect(() => {
      const elm = mediaRef.current;
      if (elm) {
        // 初始化状态
        setIsPaused(elm.paused);
        const isVideoMedia = elm instanceof HTMLVideoElement;
        setIsVideo(isVideoMedia);
        setVideoDuration(elm.duration);
        setCurrentTime(elm.currentTime);

        // 模拟双击播放
        const dblclickController = isVideoMedia
          ? bindEvent(elm, 'click', () => {
              if (videoFirstClicked.current) {
                handleTogglePlay();
              } else {
                videoFirstClicked.current = true;
                window.setTimeout(() => (videoFirstClicked.current = false), 300);
              }
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

        // 加载第一帧完成
        const loadeddataController = bindEvent(elm, 'loadeddata', () => {
          setVideoDuration(elm.duration);
        });

        // 播放时间改变事件
        const timeupdateController = bindEvent(elm, 'timeupdate', () => {
          setCurrentTime(elm.currentTime);
        });

        // 等待事件
        const waitingController = bindEvent(elm, 'waiting', () => {
          setIsWaiting(true);
        });

        // 可播放事件
        const canplayController = bindEvent(elm, 'canplay', () => {
          setIsWaiting(false);
        });

        const loadstartController = bindEvent(elm, 'loadstart', () => {
          setIsWaiting(true);
        });

        return () => {
          loadstartController.abort();
          playController.abort();
          pauseController.abort();
          loadeddataController.abort();
          timeupdateController.abort();
          waitingController.abort();
          canplayController.abort();
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
          mediaRef={mediaRef}
          currentTime={currentTime}
          videoDuration={videoDuration}
          previewDiffTime={currentDragDiffTime}
        />

        <StyledToolsRow>
          <ProgressInfo
            currentTime={currentTime}
            videoDuration={videoDuration}
          />

          <StyledBtnsContainer>
            <StyledBtnsGroup>
              {/* 播放模式 */}
              {isList && onToggleRandom && (
                <IconButton onClick={onToggleRandom}>
                  {isRandomPlay ? <ShuffleRounded /> : <FormatListNumberedRtlRounded />}
                </IconButton>
              )}

              {/* 倍速 */}
              <RateSetting mediaRef={mediaRef} />

              {/* 旋转 */}
              {isVideo && <RotateSetting mediaRef={mediaRef} />}
            </StyledBtnsGroup>

            <StyledBtnsGroup>
              {/* 上一个 */}
              {isList && (
                <IconButton
                  onClick={handlePrev}
                  disabled={firstDisabled}
                >
                  <SkipPreviousRounded />
                </IconButton>
              )}

              {/* 播放 */}
              <IconButton
                onClick={handleTogglePlay}
                disabled={isWaiting}
              >
                {isPaused ? <PlayArrowRounded /> : <PauseRounded />}
              </IconButton>

              {/* 下一个 */}
              {isList && (
                <IconButton
                  onClick={handleNext}
                  disabled={lastDisabled}
                >
                  <SkipNextRounded />
                </IconButton>
              )}
            </StyledBtnsGroup>

            <StyledBtnsGroup>
              {/* 字幕 */}
              {!showMore && (
                <SubtitleSetting
                  mediaRef={mediaRef}
                  subtitleOptions={subtitles}
                />
              )}

              {/* 音量 */}
              {!showMore && <VolumeSetting mediaRef={mediaRef} />}

              {/* 全屏 */}
              {isVideo && <FullscreenSetting mediaRef={mediaRef} />}

              {/* 更多 */}
              {showMore && (
                <TooltipSetting
                  open={moreOpen}
                  tooltipContent={
                    <StyledBtnsGroup>
                      <SubtitleSetting
                        mediaRef={mediaRef}
                        subtitleOptions={subtitles}
                      />
                      <VolumeSetting mediaRef={mediaRef} />
                    </StyledBtnsGroup>
                  }
                >
                  <IconButton onClick={handleToggleMoreOpen}>
                    <MoreVertRounded />
                  </IconButton>
                </TooltipSetting>
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
