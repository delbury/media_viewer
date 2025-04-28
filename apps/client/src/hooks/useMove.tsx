import { useEffect, useRef } from 'react';
import { useThrottle } from './useThrottle';

interface UseMoveParams {
  domRef: React.RefObject<HTMLElement | null>;
  onEnter?: (pos: [number, number]) => void;
  onMove?: (pos: [number, number], size: { width: number; height: number }) => void;
  onLeave?: () => void;
}

export const useMove = ({ domRef, onEnter, onMove, onLeave }: UseMoveParams) => {
  const enable = useRef(false);

  const onMoveThrottle = useThrottle(onMove, {
    byAnimationFrame: true,
    notCacheLastCall: true,
  });

  useEffect(() => {
    const elm = domRef.current;
    if (elm) {
      const enterController = new AbortController();
      const moveController = new AbortController();
      const leaveController = new AbortController();

      elm.addEventListener(
        'pointerenter',
        ev => {
          enable.current = true;
          const { offsetX, offsetY } = ev;
          onEnter?.([offsetX, offsetY]);
        },
        { signal: enterController.signal }
      );

      elm.addEventListener(
        'pointermove',
        ev => {
          if (enable.current) {
            const { offsetX, offsetY } = ev;
            const { offsetWidth, offsetHeight } = ev.target as HTMLElement;
            onMoveThrottle?.([offsetX, offsetY], { width: offsetWidth, height: offsetHeight });
          }
        },
        { signal: moveController.signal }
      );

      elm.addEventListener(
        'pointerleave',
        () => {
          enable.current = false;
          onLeave?.();
        },
        { signal: enterController.signal }
      );

      return () => {
        enterController.abort();
        moveController.abort();
        leaveController.abort();
      };
    }
  }, [domRef, onEnter, onLeave, onMoveThrottle]);
};
