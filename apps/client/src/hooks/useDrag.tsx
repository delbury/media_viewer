'use client';

import { preventDefault } from '#/utils';
import { DOMAttributes, PointerEventHandler, useCallback, useEffect, useRef } from 'react';
import { useThrottle } from './useThrottle';

export interface UseDragParams {
  callback: (offset: [number, number]) => void | false;
  watchAxis?: 'both' | 'x' | 'y';
  // 外部传入的初始累积偏移值
  defaultOffset?: [number, number];
  // 开始拖拽
  onStart?: () => void;
  // 结束拖拽
  onEnd?: () => void;
  // 使用节流时间
  throttleTime?: number;
}

const MOVE_EVENT_NAME = 'pointermove';
const UP_EVENT_NAME = 'pointerup';

export const useDrag = ({
  callback,
  watchAxis = 'both',
  defaultOffset,
  onStart,
  onEnd,
  throttleTime,
}: UseDragParams) => {
  // 鼠标点击的原点
  const startPosition = useRef<[number, number]>(null);
  // 累积的偏移，用于多次拖拽的累积计算
  const lastOffset = useRef<[number, number]>(defaultOffset ?? [0, 0]);
  // 当次拖拽时，鼠标相对于点击原点的实时偏移值
  const currentOffsetOnTime = useRef<[number, number]>([0, 0]);
  // 当前按下的指针 id
  const currentActivedPointerId = useRef<number>(null);

  // 中断信号
  const abortMouseMove = useRef<AbortController>(null);
  const abortMouseUp = useRef<AbortController>(null);

  const mouseMoveThrottle = useThrottle(
    (dx: number, dy: number) => {
      const flag = callback([dx, dy]);
      if (flag === false) return;
      currentOffsetOnTime.current = [dx, dy];
    },
    {
      timeout: throttleTime,
      notCacheLastCall: true,
    }
  );

  const clearEvents = useCallback(() => {
    abortMouseMove.current?.abort();
    abortMouseMove.current = null;
    abortMouseUp.current?.abort();
    abortMouseUp.current = null;
  }, [abortMouseMove, abortMouseUp]);

  // 点击事件，开始
  const fnMouseDown: PointerEventHandler<HTMLElement> = useCallback(
    ev => {
      // 如果已经按下了，则跳过
      if (currentActivedPointerId.current !== null) return;
      currentActivedPointerId.current = ev.pointerId;

      preventDefault(ev);
      onStart?.();

      startPosition.current = [ev.clientX, ev.clientY];

      abortMouseMove.current = new AbortController();
      abortMouseUp.current = new AbortController();

      // 拖动中
      document.addEventListener(
        MOVE_EVENT_NAME,
        ev => {
          if (currentActivedPointerId.current !== ev.pointerId) return;
          preventDefault(ev);

          const dx =
            watchAxis === 'y'
              ? 0
              : ev.clientX - (startPosition.current?.[0] ?? 0) + lastOffset.current[0];
          const dy =
            watchAxis === 'x'
              ? 0
              : ev.clientY - (startPosition.current?.[1] ?? 0) + lastOffset.current[1];

          if (watchAxis === 'x') {
            if (dx === currentOffsetOnTime.current[0]) return;
          } else if (watchAxis === 'y') {
            if (dy === currentOffsetOnTime.current[1]) return;
          } else {
            if (dx === currentOffsetOnTime.current[0] && dy === currentOffsetOnTime.current[1])
              return;
          }

          // 节流
          mouseMoveThrottle(dx, dy);
        },
        { signal: abortMouseMove.current.signal }
      );

      // 拖动结束
      document.addEventListener(
        UP_EVENT_NAME,
        ev => {
          if (currentActivedPointerId.current !== ev.pointerId) return;

          currentActivedPointerId.current = null;
          startPosition.current = null;
          lastOffset.current = [...currentOffsetOnTime.current];
          onEnd?.();
          clearEvents();
        },
        { signal: abortMouseUp.current.signal }
      );
    },
    [clearEvents, mouseMoveThrottle, onEnd, onStart, watchAxis]
  );

  // 重置拖拽
  const reset = useCallback(() => {
    lastOffset.current = defaultOffset ?? [0, 0];
  }, [defaultOffset]);

  // 移除事件
  useEffect(() => {
    return () => {
      clearEvents();
    };
  }, []);

  return {
    events: {
      onPointerDown: fnMouseDown,
      // onContextMenu: preventDefault,
    } satisfies DOMAttributes<HTMLElement>,
    reset,
  };
};
