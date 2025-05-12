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
import SourceSetting from './components/SourceSetting';
import SubtitleSetting from './components/SubtitleSetting';
import VolumeSetting from './components/VolumeSetting';
import { useHandlers } from './hooks/useHandlers';
import { useMobileGesture } from './hooks/useMobileGesture';
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
  isRawSource?: boolean;
  useSource?: boolean;
  onUseSourceChange?: (v: boolean) => void;
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
      isRawSource,
      useSource,
      onUseSourceChange,
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
    const showSubtitle = !isH5 && isVideo;
    const showSource = !isH5 && isVideo;
    const showVolume = !isVideo || !isH5;
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
      onUpPressed: isList ? handlePrev : void 0,
      onDownPressed: isList ? handleNext : void 0,
      onLeftPressed: handleBack,
      onRightPressed: handleForward,
      onSpacePressed: handleTogglePlay,
      onEnterPressed: handleTogglePlay,
    });

    // 移动端，手势拖拽的操作
    const { skipTimeText, currentDragDiffTime } = useMobileGesture({
      mediaRef,
      handleGoBy,
    });

    // 在模拟双击播放时，记录处于的阶段
    // 0: 未开始，1: 第一次按下，2: 第一次抬起，3: 第二次按下
    const dblClickStage = useRef(0);
    const dblTimer = useRef<number>(null);

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
        const pointerdownController = isVideoMedia
          ? bindEvent(elm, 'pointerdown', () => {
              if (!dblClickStage.current) {
                // 超时重置
                window.setTimeout(() => {
                  dblClickStage.current = 0;
                  dblTimer.current = null;
                }, 300);
                dblClickStage.current++;
              } else if (dblClickStage.current === 2) {
                dblClickStage.current++;
              }
            })
          : null;
        const pointerupController = isVideoMedia
          ? bindEvent(elm, 'pointerup', () => {
              if (dblClickStage.current === 3) {
                handleTogglePlay();
                dblClickStage.current = 0;
                if (dblTimer.current) {
                  clearTimeout(dblTimer.current);
                  dblTimer.current = null;
                }
              } else if (dblClickStage.current === 1) {
                dblClickStage.current++;
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

        // 开始加载
        const loadstartController = bindEvent(elm, 'loadstart', () => {
          setIsWaiting(true);
        });

        return () => {
          pointerdownController?.abort();
          pointerupController?.abort();
          loadstartController.abort();
          playController.abort();
          pauseController.abort();
          loadeddataController.abort();
          timeupdateController.abort();
          waitingController.abort();
          canplayController.abort();
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
          onGoTo={() => setIsWaiting(true)}
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
              {showSubtitle && (
                <SubtitleSetting
                  mediaRef={mediaRef}
                  subtitleOptions={subtitles}
                />
              )}

              {/* 手动转码 */}
              {showSource && (
                <SourceSetting
                  isAuto={isRawSource}
                  useSource={useSource}
                  onUseSourceChange={onUseSourceChange}
                />
              )}

              {/* 音量 */}
              {showVolume && <VolumeSetting mediaRef={mediaRef} />}

              {/* 全屏 */}
              {isVideo && <FullscreenSetting mediaRef={mediaRef} />}

              {/* 更多 */}
              {showMore && isVideo && (
                <TooltipSetting
                  open={moreOpen}
                  tooltipContent={
                    <StyledBtnsGroup>
                      <SubtitleSetting
                        mediaRef={mediaRef}
                        subtitleOptions={subtitles}
                      />
                      <SourceSetting
                        isAuto={isRawSource}
                        useSource={useSource}
                        onUseSourceChange={onUseSourceChange}
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
