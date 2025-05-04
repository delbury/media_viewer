import { useCancelAreaContext } from '#/hooks/useCancelAreaContext';
import { useDrag } from '#/hooks/useDrag';
import { useGesture } from '#/hooks/useGesture';
import { useResizeObserver } from '#/hooks/useResizeObserver';
import { useRotateState } from '#/hooks/useRotateState';
import { useShortcut } from '#/hooks/useShortcut';
import { formatTime } from '#/utils';
import { FileInfo } from '#pkgs/apis';
import { Theme } from '@emotion/react';
import {
  FullscreenExitRounded,
  FullscreenRounded,
  PauseRounded,
  PlayArrowRounded,
  SkipNextRounded,
  SkipPreviousRounded,
} from '@mui/icons-material';
import { IconButton, SxProps } from '@mui/material';
import { isNil } from 'lodash-es';
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
import { calcTimeRanges } from '../VideoViewer/util';
import AlertInfo from './components/AlertInfo';
import { MediaProgress } from './components/MediaProgress';
import RateSetting, { MAX_RATE } from './components/RateSetting';
import RotateSetting from './components/RotateSetting';
import SubtitleSetting, { Subtitle } from './components/SubtitleSetting';
import VolumeSetting from './components/VolumeSetting';
import { useHandlers } from './hooks/useHandlers';
import {
  StyledBtnsContainer,
  StyledBtnsGroup,
  StyledInfoDivider,
  StyledMediaControlsWrapper,
  StyledProgressInfo,
  StyledToolsRow,
} from './style';

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

// 在 video 上拖动时，每像素的偏移时间
const PROGRESS_DRAG_PER_PX = 0.1;
// 判断在 video 上拖拽的方向时的最小距离的平方
const DRAG_DIR_MIN_DISTANCE = 5 ** 2;

// 取消区域的样式
const CANCEL_AREA_SX: SxProps<Theme> = {
  marginTop: '72px',
};

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

    // 之前的播放速度
    const lastRate = useRef<number>(null);
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

    // 当前播放的进度信息，用于展示
    const ct = Math.floor(currentTime);
    const tt = Math.floor(videoDuration);
    const currentInfo = useMemo(() => formatTime(ct, { withHour: tt >= 3600 }), [ct, tt]);
    const totalInfo = useMemo(() => formatTime(tt), [tt]);

    /**
     * start 用以控制视频旋转并自适应缩放
     */
    // 旋转值，用于旋转
    const { degree: currentDegree, setDegree: setCurrentDegree } = useRotateState({
      defaultDegree: 0,
      domRef: mediaRef,
    });
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
    /** end */

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
      handleGoBy,
      handleToggleSubtitle,
    } = useHandlers({
      mediaRef,
      setIsPaused,
      setIsFullScreen,
      currentDegree,
      setCurrentDegree,
      currentSubtitle,
      setCurrentSubtitle,
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

    /**
     * start video 上的拖动控制
     */
    // 拖拽方向
    const currentDragDirection = useRef<'x' | 'y' | null>(null);
    // 判断当前拖拽距离
    const currentDragOffsetInstant = useRef<[number, number] | null>(null);
    const [currentDragOffset, setCurrentDragOffset] = useState<[number, number] | null>(null);
    // 拖拽结束
    const handleDragEnd = useCallback(() => {
      if (currentDragDirection.current === 'x' && currentDragOffsetInstant.current) {
        const diffTime = currentDragOffsetInstant.current[0] * PROGRESS_DRAG_PER_PX;
        handleGoBy(1, diffTime);
      }
    }, [handleGoBy]);
    // 重置
    const handleResetDrag = useCallback(() => {
      currentDragDirection.current = null;
      currentDragOffsetInstant.current = null;
      setCurrentDragOffset(null);
    }, []);
    // 拖拽中
    const handleDrag = useCallback((offset: [number, number]) => {
      if (
        !currentDragDirection.current &&
        offset[0] ** 2 + offset[1] ** 2 >= DRAG_DIR_MIN_DISTANCE
      ) {
        currentDragDirection.current = Math.abs(offset[0]) > Math.abs(offset[1]) ? 'x' : 'y';
      }
      setCurrentDragOffset(offset);
      currentDragOffsetInstant.current = offset;
    }, []);
    // 手势检测
    const { detectGesture } = useGesture();
    // 拖拽 hook
    const { dragEventHandler } = useDrag({
      onlyMobile: true,
      callback: handleDrag,
      resetAtEnd: true,
    });
    // 当前拖拽跳转展示的时间信息
    const skipTimeText = useMemo(() => {
      const dir = currentDragDirection.current;
      if (!currentDragOffset || !dir) return;
      if (dir === 'x') {
        // 水平方向拖动
        const timeText = formatTime(currentDragOffset[0] * PROGRESS_DRAG_PER_PX, {
          fixed: 1,
          withSymbol: true,
        });
        return timeText;
      }
    }, [currentDragOffset]);
    // 跳转的相对时间
    const currentDragDiffTime = useMemo(() => {
      if (currentDragDirection.current !== 'x') return;
      return currentDragOffset ? currentDragOffset[0] * PROGRESS_DRAG_PER_PX : void 0;
    }, [currentDragOffset]);
    // 中途取消
    const ifDisableDrag = useCallback(() => currentDragDirection.current !== 'x', []);
    useCancelAreaContext({
      domRef: mediaRef,
      onActivatedCallback: handleDragEnd,
      onFinal: handleResetDrag,
      areaSx: CANCEL_AREA_SX,
      ifDisable: ifDisableDrag,
    });
    /* end */

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

        // 指针按下
        const pointerDownController = isVideoMedia
          ? bindEvent(elm, 'pointerdown', async ev => {
              if (ev.pointerType === 'mouse') return;
              // 当触摸开始时一段时间内命中了某个手势操作后，则不进入 drag 操作
              const gesture = await detectGesture(ev);
              // 未完成手势，跳过
              if (!gesture) return;
              // 单指拖动，进入 drag 操作
              if (gesture.type === 'single-move') dragEventHandler(ev);
              // 单指按下，进入快速播放模式
              if (gesture.type === 'single-down') {
                lastRate.current = elm.playbackRate;
                elm.playbackRate = MAX_RATE;
              }
            })
          : null;

        // 指针抬起
        const pointerUpController = isVideoMedia
          ? bindEvent(elm, 'pointerup', async ev => {
              if (ev.pointerType === 'mouse') return;
              detectGesture(ev);

              if (!isNil(lastRate.current)) {
                elm.playbackRate = lastRate.current;
                lastRate.current = null;
              }
            })
          : null;

        // 指针移动
        const pointerMoveController = isVideoMedia
          ? bindEvent(elm, 'pointermove', async ev => {
              if (ev.pointerType === 'mouse') return;
              detectGesture(ev);
            })
          : null;

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
          pointerDownController?.abort();
          pointerUpController?.abort();
          pointerMoveController?.abort();
        };
      }
    }, [detectGesture, dragEventHandler, handleTogglePlay, mediaRef]);

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
                onClick={handleSwitchRate}
              />

              {/* 旋转 */}
              {isVideo && (
                <RotateSetting
                  degree={currentDegree}
                  onDegreeChange={handleDegreeChange}
                  onClick={handleToggleRotate}
                />
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
              {/* 字幕 */}
              {isVideo && (
                <SubtitleSetting
                  subtitle={currentSubtitle}
                  onSubtitleChange={setCurrentSubtitle}
                  subtitleOptions={subtitles}
                  onClick={handleToggleSubtitle}
                />
              )}

              {/* 静音 */}
              <VolumeSetting
                volume={currentVolume}
                onVolumeChange={handleVolumeChange}
                onClick={handleToggleMute}
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
