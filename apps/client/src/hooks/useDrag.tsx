'use client';

import { preventDefault } from '#/utils';
import { PointerEvent as ReactPointerEvent, useCallback, useEffect, useRef } from 'react';
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
  // 拖拽后重置
  resetAtEnd?: boolean;
  // 只在移动端使用
  onlyMobile?: boolean;
}

const MOVE_EVENT_NAME = 'pointermove';
const UP_EVENT_NAME = 'pointerup';

export const useDrag = ({
  callback,
  watchAxis = 'both',
  defaultOffset,
  onStart,
  onEnd,
  resetAtEnd,
  onlyMobile,
}: UseDragParams) => {
  // 鼠标点击的原点
  const startPosition = useRef<[number, number]>(null);
  // 累积的偏移，用于多次拖拽的累积计算
  const lastOffset = useRef<[number, number]>(defaultOffset ?? [0, 0]);
  // 当次拖拽时，鼠标相对于点击原点的实时偏移值
  const currentOffsetOnTime = useRef<[number, number]>([0, 0]);
  // 当前按下的指针 id
  const currentActivePointerId = useRef<number>(null);

  // 中断信号
  const moveController = useRef<AbortController>(null);
  const upController = useRef<AbortController>(null);

  // drag 回调
  const pointerMove = useCallback(
    (dx: number, dy: number) => {
      const flag = callback([dx, dy]);
      if (flag === false) return;
      currentOffsetOnTime.current = [dx, dy];
    },
    [callback]
  );
  const pointerMoveThrottle = useThrottle(pointerMove, {
    notCacheLastCall: true,
    byAnimationFrame: true,
  });

  const clearEvents = useCallback(() => {
    moveController.current?.abort();
    moveController.current = null;
    upController.current?.abort();
    upController.current = null;
    currentActivePointerId.current = null;
  }, []);

  // 重置拖拽
  const resetDragOffset = useCallback(() => {
    lastOffset.current = defaultOffset ?? [0, 0];
  }, [defaultOffset]);

  // 点击事件，开始
  const fnPointerDown = useCallback(
    (ev: PointerEvent | ReactPointerEvent<HTMLElement>) => {
      if (onlyMobile && ev.pointerType === 'mouse') return;

      // 如果已经按下了，则跳过
      if (currentActivePointerId.current !== null) return;
      currentActivePointerId.current = ev.pointerId;

      preventDefault(ev);
      onStart?.();

      startPosition.current = [ev.clientX, ev.clientY];

      moveController.current = new AbortController();
      upController.current = new AbortController();

      // 拖动中
      document.addEventListener(
        MOVE_EVENT_NAME,
        ev => {
          if (currentActivePointerId.current !== ev.pointerId) return;
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
          pointerMoveThrottle(dx, dy);
        },
        { signal: moveController.current.signal }
      );

      // 拖动结束
      document.addEventListener(
        UP_EVENT_NAME,
        ev => {
          if (currentActivePointerId.current !== ev.pointerId) return;

          currentActivePointerId.current = null;
          startPosition.current = null;
          lastOffset.current = [...currentOffsetOnTime.current];
          onEnd?.();
          clearEvents();
          if (resetAtEnd) resetDragOffset();
        },
        { signal: upController.current.signal }
      );
    },
    [
      onlyMobile,
      onStart,
      watchAxis,
      pointerMoveThrottle,
      onEnd,
      clearEvents,
      resetAtEnd,
      resetDragOffset,
    ]
  );

  // 移除事件
  useEffect(() => {
    return () => {
      clearEvents();
    };
  }, []);

  return {
    dragEventHandler: fnPointerDown,
    resetDragOffset,
  };
};
