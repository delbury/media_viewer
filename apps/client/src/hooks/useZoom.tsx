import { preventDefault } from '#/utils';
import { useCallback, useEffect, useRef } from 'react';

export interface UserZoomParams {
  callback: (diffScale: number, startPos: [number, number]) => void;
  // 开始拖拽
  onStart?: () => void;
  // 结束拖拽
  onEnd?: () => void;
}

const MOVE_EVENT_NAME = 'pointermove';
const UP_EVENT_NAME = 'pointerup';

const calcDistance = (a: [number, number], b: [number, number]) => {
  const cx = a[0] - b[0];
  const cy = a[1] - b[1];
  return Math.sqrt(cx ** 2 + cy ** 2);
};

export const useZoom = ({ onStart, onEnd, callback }: UserZoomParams) => {
  // 当前双触点的 id => 位置信息
  const currentPointers = useRef<Record<string, [number, number]>>({});
  // 手startPoints势开始时双触点的距离
  const startDistance = useRef<number>(0);
  // 当前的双触点的距离
  const currentDistance = useRef<number>(0);
  // 开始 zoom 时的双触点中点
  const startCenterPosition = useRef<[number, number]>([0, 0]);

  // 中断信号
  const moveController = useRef<AbortController>(null);
  const upController = useRef<AbortController>(null);

  // 解绑事件
  const clearEvents = useCallback(() => {
    moveController.current?.abort();
    moveController.current = null;
    upController.current?.abort();
    upController.current = null;
  }, []);

  // 点击事件，开始
  const fnPointerDown = useCallback(
    (infos: Record<string, [number, number]>) => {
      onStart?.();

      currentPointers.current = infos;
      const pointers = Object.values(currentPointers.current);
      startDistance.current = calcDistance(pointers[0], pointers[1]);

      startCenterPosition.current = [
        (pointers[0][0] + pointers[1][0]) / 2,
        (pointers[0][1] + pointers[1][1]) / 2,
      ];

      // 绑定事件
      moveController.current = new AbortController();
      upController.current = new AbortController();

      // zoom 中
      document.addEventListener(
        MOVE_EVENT_NAME,
        ev => {
          if (!currentPointers.current[ev.pointerId]) return;
          preventDefault(ev);
          // 更新触点位置
          currentPointers.current[ev.pointerId] = [ev.clientX, ev.clientY];

          const ps = Object.values(currentPointers.current);
          // 计算更新后的双触点距离
          currentDistance.current = calcDistance(ps[0], ps[1]);

          const zoomScale = currentDistance.current / startDistance.current;

          callback(zoomScale, startCenterPosition.current);
        },
        {
          signal: moveController.current.signal,
        }
      );

      // zoom 结束
      document.addEventListener(
        UP_EVENT_NAME,
        ev => {
          if (!currentPointers.current[ev.pointerId]) return;

          clearEvents();
          onEnd?.();
        },
        {
          signal: upController.current.signal,
        }
      );
    },
    [callback, clearEvents, onEnd, onStart]
  );

  useEffect(() => {
    return () => {
      clearEvents();
    };
  }, [clearEvents]);

  return {
    zoomEventHandler: fnPointerDown,
  };
};
