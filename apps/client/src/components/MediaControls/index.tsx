import { formatTime } from '#/utils';
import {
  PauseRounded,
  PlayArrowRounded,
  SkipNextRounded,
  SkipPreviousRounded,
  VolumeOffRounded,
  VolumeUpRounded,
} from '@mui/icons-material';
import { IconButton, Typography } from '@mui/material';
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
  StyledMediaControlsWrapper,
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
}

const MediaControls = forwardRef<MediaControlsInstance, MediaControls>(
  ({ mediaRef, onPausedStateChange, onWaitingStateChange }, ref) => {
    const [isPaused, setIsPaused] = useState(true);
    const [bufferRanges, setBufferRanges] = useState<[number, number][]>([]);
    const [videoDuration, setVideoDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [currentVolume, setCurrentVolume] = useState(0);
    const [isWaiting, setIsWaiting] = useState(false);

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
    const fullProgressInfo = useMemo(
      () => `${currentInfo} / ${totalInfo}`,
      [currentInfo, totalInfo]
    );

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
      const media = mediaRef.current;
      if (media) {
        // 初始化状态
        setIsPaused(media.paused);
        setIsMuted(media.muted);
        setCurrentVolume(media.volume);

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

        // 等待事件
        const waitingController = bindEvent(media, 'waiting', () => {
          setIsWaiting(true);
        });

        // 可播放事件
        const canplayController = bindEvent(media, 'canplay', () => {
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
          <Typography variant="body2">{fullProgressInfo}</Typography>

          <StyledBtnsContainer>
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
            </StyledBtnsGroup>
          </StyledBtnsContainer>
        </StyledToolsRow>
      </StyledMediaControlsWrapper>
    );
  }
);

MediaControls.displayName = 'MediaControls';

export default MediaControls;
