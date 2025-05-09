import { isNil, noop } from 'lodash-es';
import { RefObject, useCallback } from 'react';

// 键盘每次跳转的时间间隔
const GO_BY_MAX_DIFF = 15;
// 键盘每次跳转的使用 GO_BY_MAX_DIFF 间隔的是最短时长
const USE_MAX_DIFF_MIN_DURATION = GO_BY_MAX_DIFF * 3;
// 短视频跳转的间隔
const GO_BY_MAX_DIFF_SHORT = 2;

interface UseHandlersParams {
  mediaRef: RefObject<HTMLMediaElement | null>;
  isPaused: boolean;
  onPrev?: () => void;
  onNext?: () => void;
}

export const useHandlers = ({ mediaRef, isPaused, onPrev, onNext }: UseHandlersParams) => {
  // 播放切换
  const handleTogglePlay = useCallback(() => {
    if (!mediaRef.current) return;
    if (mediaRef.current.paused) {
      mediaRef.current.play().catch(noop);
    } else {
      mediaRef.current.pause();
    }
  }, [mediaRef]);

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

  const handlePrev = useCallback(() => {
    onPrev?.();
    if (!isPaused && mediaRef.current) {
      mediaRef.current.addEventListener(
        'canplay',
        () => {
          mediaRef.current?.play();
        },
        { once: true }
      );
    }
  }, [isPaused, mediaRef, onPrev]);

  const handleNext = useCallback(() => {
    onNext?.();
    if (!isPaused && mediaRef.current) {
      mediaRef.current.addEventListener(
        'canplay',
        () => {
          mediaRef.current?.play();
        },
        { once: true }
      );
    }
  }, [isPaused, mediaRef, onNext]);

  return {
    handleTogglePlay,
    handleBack,
    handleForward,
    handleGoBy,
    handlePrev,
    handleNext,
  };
};
