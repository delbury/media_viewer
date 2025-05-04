import { normalizeDegree } from '#/utils';
import { useCallback, useRef, useState } from 'react';
import { useEventCallback } from './useEventCallback';

interface UseRotateStateParams {
  defaultDegree: number;
  domRef: React.RefObject<HTMLElement | null>;
}

export const useRotateState = ({ defaultDegree, domRef }: UseRotateStateParams) => {
  // 旋转值，用于旋转
  const [degree, setDegreeRaw] = useState(defaultDegree);
  const enableTransitionPromise = useRef<Promise<void>>(null);
  const setDegree = useCallback(async (newDeg: number | ((curDeg: number) => number)) => {
    if (enableTransitionPromise.current) {
      await enableTransitionPromise.current;
    }
    setDegreeRaw(newDeg);
  }, []);

  // 禁用图片过渡动画
  const disableTransition = useCallback(() => {
    domRef.current?.style.setProperty('transition', 'none', 'important');
  }, [domRef]);

  // 启用图片过渡动画
  const enableTransition = useCallback(() => {
    const promise = new Promise<void>(resolve => {
      window.setTimeout(() => {
        domRef.current?.style.removeProperty('transition');
        resolve();
      }, 100);
    });
    enableTransitionPromise.current = promise.finally(() => {
      enableTransitionPromise.current = null;
    });
  }, [domRef]);

  // 监听过渡事件
  const transitionendCallback = useCallback(
    (ev: TransitionEvent) => {
      if (ev.propertyName === 'transform') {
        if (degree >= 0 && degree < 360) return;
        const pureDeg = normalizeDegree(degree);
        disableTransition();
        setDegree(pureDeg);
        enableTransition();
      }
    },
    [degree, disableTransition, enableTransition, setDegree]
  );

  useEventCallback({
    domRef: domRef,
    eventName: 'transitionend',
    callback: transitionendCallback,
  });

  return {
    disableTransition,
    enableTransition,
    degree,
    setDegree,
  };
};
