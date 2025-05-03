import { isNil, noop } from 'lodash-es';
import { RefObject, useCallback, useRef } from 'react';
import { RootType } from '../FixedModal';
import { SWITCH_RATE_OPTIONS } from './RateSetting';
import { Subtitle } from './SubtitleSetting';

// 键盘每次跳转的时间间隔
const GO_BY_MAX_DIFF = 15;
// 键盘每次跳转的使用 GO_BY_MAX_DIFF 间隔的是最短时长
const USE_MAX_DIFF_MIN_DURATION = GO_BY_MAX_DIFF * 3;
// 短视频跳转的间隔
const GO_BY_MAX_DIFF_SHORT = 2;

interface UseHandlersParams {
  mediaRef: RefObject<HTMLMediaElement | null>;
  setIsPaused: (v: boolean) => void;
  setIsFullScreen: (v: boolean) => void;
  currentDegree: number;
  setCurrentDegree: (deg: number | ((deg: number) => number)) => Promise<void>;
  currentSubtitle?: Subtitle;
  setCurrentSubtitle: (s?: Subtitle) => void;
}

export const useHandlers = ({
  mediaRef,
  setIsPaused,
  setIsFullScreen,
  currentDegree,
  setCurrentDegree,
  currentSubtitle,
  setCurrentSubtitle,
}: UseHandlersParams) => {
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
  }, [mediaRef, setIsPaused]);

  // 静音切换
  const handleToggleMute = useCallback(() => {
    if (!mediaRef.current) return;
    mediaRef.current.muted = !mediaRef.current.muted;
  }, [mediaRef]);

  // 全屏切换
  const handleToggleFullScreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullScreen(false);
    } else {
      let curElm: HTMLElement | null = mediaRef.current;
      while (curElm) {
        if (curElm.dataset.root === RootType.Media) break;
        curElm = curElm.parentElement;
      }
      if (!curElm) return;
      curElm.requestFullscreen();
      setIsFullScreen(true);
    }
  }, [mediaRef, setIsFullScreen]);

  // 跳转到对应的进度条时刻
  const handleGoTo = useCallback(
    (time: number) => {
      if (!mediaRef.current) return;
      mediaRef.current.currentTime = time;
    },
    [mediaRef]
  );

  // 跳转相对时间
  const handleGoBy = useCallback(
    (dir: 1 | -1, diff?: number) => {
      const elm = mediaRef.current;
      if (!elm) return;

      if (isNil(diff)) {
        // 短视频限制跳转时间间隔
        diff = elm.duration <= USE_MAX_DIFF_MIN_DURATION ? GO_BY_MAX_DIFF_SHORT : GO_BY_MAX_DIFF;
      }

      let newTime = elm.currentTime + diff * dir;

      // 边界限制
      if (newTime < 0) newTime = 0;
      else if (newTime > elm.duration) newTime = elm.duration;

      elm.currentTime = newTime;
    },
    [mediaRef]
  );
  const handleBack = useCallback(() => {
    handleGoBy(-1);
  }, [handleGoBy]);
  const handleForward = useCallback(() => {
    handleGoBy(1);
  }, [handleGoBy]);

  // 改变音量
  const handleVolumeChange = useCallback(
    (v: number) => {
      if (!mediaRef.current) return;
      mediaRef.current.volume = v;
    },
    [mediaRef]
  );

  // 改变速率
  const handleRateChange = useCallback(
    (v: number) => {
      if (!mediaRef.current) return;
      mediaRef.current.playbackRate = v;
    },
    [mediaRef]
  );

  // 切换速率
  const handleSwitchRate = useCallback(() => {
    if (!mediaRef.current) return;
    const rate = mediaRef.current.playbackRate;
    const index = SWITCH_RATE_OPTIONS.findIndex(v => v === rate);
    let newRate = 1;
    if (index > -1) newRate = SWITCH_RATE_OPTIONS[(index + 1) % SWITCH_RATE_OPTIONS.length];
    mediaRef.current.playbackRate = newRate;
  }, [mediaRef]);

  // 切换旋转
  const handleToggleRotate = useCallback(() => {
    let deg = currentDegree;
    const rest = currentDegree % 360;
    if (rest === 0 || rest > 180) deg += 90;
    else deg -= rest;
    setCurrentDegree(deg);
  }, [currentDegree, setCurrentDegree]);

  // 改变旋转
  const handleDegreeChange = useCallback(
    (newDeg: number) => {
      setCurrentDegree(curDeg => {
        // 判断当前的旋转在哪
        const rest = curDeg % 360;
        // 旋转不变
        if (rest === newDeg) return curDeg;
        // 新的旋转角度小于与当前角度的差值
        const diff = newDeg - rest;
        // 如果差值小于等于 180，直接转
        if (Math.abs(diff) <= 180) return curDeg + diff;
        // 否则，差值大于270
        return curDeg + diff + (diff > 0 ? -360 : 360);
      });
    },
    [setCurrentDegree]
  );

  // 之前的字幕
  const lastSubtitle = useRef<Subtitle>(void 0);
  // 启用、禁用字幕
  const handleToggleSubtitle = useCallback(() => {
    if (currentSubtitle) {
      lastSubtitle.current = currentSubtitle;
      setCurrentSubtitle(void 0);
    } else {
      setCurrentSubtitle(lastSubtitle.current);
      lastSubtitle.current = void 0;
    }
  }, [currentSubtitle, setCurrentSubtitle]);

  return {
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
  };
};
