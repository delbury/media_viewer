import { useEffect, useRef } from 'react';
import { useThrottle } from './useThrottle';

interface UseMoveParams {
  domRef: React.RefObject<HTMLElement | null>;
  onEnter?: () => void;
  onMove?: (pos: [number, number]) => void;
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
        () => {
          enable.current = true;
          onEnter?.();
        },
        { signal: enterController.signal }
      );

      elm.addEventListener(
        'pointermove',
        ev => {
          if (enable.current) {
            const { offsetX, offsetY } = ev;
            onMoveThrottle?.([offsetX, offsetY]);
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
