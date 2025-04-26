import {
  PauseRounded,
  PlayArrowRounded,
  SkipNextRounded,
  SkipPreviousRounded,
  UnfoldLessRounded,
  VolumeOffRounded,
  VolumeUpRounded,
} from '@mui/icons-material';
import { IconButton, LinearProgress } from '@mui/material';
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
import {
  StyledBtnsGroup,
  StyledCursorContainer,
  StyledMediaControlsWrapper,
  StyledProgressContainer,
} from './style';

const BUFFER_BAR_COLOR = 'var(--mui-palette-grey-600)';
const BUFFER_BAR_COLOR_EMPTY = 'transparent';

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
}

const MediaControls = forwardRef<MediaControlsInstance, MediaControls>(
  ({ mediaRef, onPausedStateChange }, ref) => {
    const [isPaused, setIsPaused] = useState(true);
    const [bufferRanges, setBufferRanges] = useState<[number, number][]>([]);
    const [videoDuration, setVideoDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [currentVolume, setCurrentVolume] = useState(0);

    useEffect(() => {
      onPausedStateChange?.(isPaused);
    }, [isPaused, onPausedStateChange]);

    // 当前播放进度
    const currentTimePercent = useMemo(
      () => currentTime && (currentTime / videoDuration) * 100,
      [currentTime, videoDuration]
    );

    // 缓存进度百分比，渐变样式
    // 10 ~ 20, 40 ~ 80
    // 0 - 10 | (10 - 20) | 20 - 40 | (40 - 80) | 80 - 100
    const bufferRangesPercentsBar = useMemo(() => {
      const pointers: string[] = [`${BUFFER_BAR_COLOR_EMPTY} 0%`];
      for (const [s, e] of bufferRanges) {
        // 计算百分比
        const sp = ((s / videoDuration) * 100).toFixed(2);
        const ep = ((e / videoDuration) * 100).toFixed(2);

        // 上一段空白段的结束
        pointers.push(`${BUFFER_BAR_COLOR_EMPTY} ${sp}%`);

        // 当前数据段
        pointers.push(`${BUFFER_BAR_COLOR} ${sp}%`);
        pointers.push(`${BUFFER_BAR_COLOR} ${ep}%`);

        // 下一段空白段的开始
        pointers.push(`${BUFFER_BAR_COLOR_EMPTY} ${ep}%`);
      }
      pointers.push(`${BUFFER_BAR_COLOR_EMPTY} 100%`);

      const bgImage = `linear-gradient(to right, ${pointers.join(',')})`;
      return bgImage;
    }, [bufferRanges, videoDuration]);

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

    useEffect(() => {
      const media = mediaRef.current;
      if (media) {
        // 初始化状态
        setIsPaused(media.paused);
        setIsMuted(media.muted);

        // 播放事件
        const playController = bindEvent(media, 'play', () => {
          setIsPaused(false);
        });

        // 暂停事件
        const pauseController = bindEvent(media, 'pause', () => {
          setIsPaused(true);
        });

        // 加载事件
        const progressController = bindEvent(media, 'progress', () => {
          const ranges = calcTimeRanges(media.buffered);
          setBufferRanges(ranges);
        });

        // 加载第一帧完成
        bindEventOnce(media, 'loadeddata', () => {
          const ranges = calcTimeRanges(media.buffered);
          setBufferRanges(ranges);
          setVideoDuration(media.duration);
        });

        // 播放时间改变事件
        const timeupdateController = bindEvent(media, 'timeupdate', () => {
          setCurrentTime(media.currentTime);
        });

        // 音量改变事件
        const volumechangeController = bindEvent(media, 'volumechange', () => {
          setIsMuted(media.muted || !media.volume);
          setCurrentVolume(media.volume);
        });

        return () => {
          playController.abort();
          pauseController.abort();
          progressController.abort();
          timeupdateController.abort();
          volumechangeController.abort();
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
        <StyledProgressContainer>
          <LinearProgress
            variant="buffer"
            value={currentTimePercent}
            valueBuffer={100}
            sx={{
              // 已缓存的进度条颜色，通过 css 渐变来显示分段颜色
              '.MuiLinearProgress-bar2': {
                backgroundImage: bufferRangesPercentsBar,
              },
            }}
          />

          <StyledCursorContainer>
            <UnfoldLessRounded />
          </StyledCursorContainer>
        </StyledProgressContainer>

        <StyledBtnsGroup>
          {/* 上一个 */}
          <IconButton>
            <SkipPreviousRounded />
          </IconButton>

          {/* 播放 */}
          <IconButton onClick={handleTogglePlay}>
            {isPaused ? <PlayArrowRounded /> : <PauseRounded />}
          </IconButton>

          {/* 下一个 */}
          <IconButton>
            <SkipNextRounded />
          </IconButton>

          {/* 静音 */}
          <IconButton onClick={handleToggleMute}>
            {isMuted ? <VolumeOffRounded /> : <VolumeUpRounded />}
          </IconButton>
        </StyledBtnsGroup>
      </StyledMediaControlsWrapper>
    );
  }
);

MediaControls.displayName = 'MediaControls';

export default MediaControls;
