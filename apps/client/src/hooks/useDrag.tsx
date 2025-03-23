'use client';

import { DOMAttributes, MouseEventHandler, useCallback, useEffect, useRef } from 'react';
import { useThrottle } from './useThrottle';

interface UseDragParams {
  callback: (offset: [number, number]) => void | false;
  watchAxis?: 'both' | 'x' | 'y';
  // 外部传入的初始累积偏移值
  defaultOffset?: [number, number];
}

const MOVE_EVENT_NAME = 'pointermove';
const UP_EVENT_NAME = 'pointerup';

export const useDrag = ({ callback, watchAxis = 'both', defaultOffset }: UseDragParams) => {
  // 鼠标点击的原点
  const startPosition = useRef<[number, number]>(null);
  // 累积的偏移，用于多次拖拽的累积计算
  const lastOffset = useRef<[number, number]>(defaultOffset ?? [0, 0]);
  // 当次拖拽时，鼠标相对于点击原点的实时偏移值
  const currentOffsetOnTime = useRef<[number, number]>([0, 0]);

  // 事件回调
  const bindFnMouseMove = useRef<(ev: MouseEvent) => void>(null);
  const bindFnMouseUp = useRef<() => void>(null);

  const mouseMoveThrottle = useThrottle((dx: number, dy: number) => {
    const flag = callback([dx, dy]);
    if (flag === false) return;
    currentOffsetOnTime.current = [dx, dy];
  }, 10);

  const fnMouseMove = (ev: MouseEvent) => {
    ev.preventDefault();

    const dx = watchAxis === 'y' ? 0 : ev.clientX - (startPosition.current?.[0] ?? 0) + lastOffset.current[0];
    const dy = watchAxis === 'x' ? 0 : ev.clientY - (startPosition.current?.[1] ?? 0) + lastOffset.current[1];

    if (watchAxis === 'x') {
      if (dx === currentOffsetOnTime.current[0]) return;
    } else if (watchAxis === 'y') {
      if (dy === currentOffsetOnTime.current[1]) return;
    } else {
      if (dx === currentOffsetOnTime.current[0] && dy === currentOffsetOnTime.current[1]) return;
    }

    // 节流
    mouseMoveThrottle(dx, dy);
  };

  const clearEvents = useCallback(() => {
    if (bindFnMouseMove.current) {
      document.removeEventListener(MOVE_EVENT_NAME, bindFnMouseMove.current);
      bindFnMouseMove.current = null;
    }
    if (bindFnMouseUp.current) {
      document.removeEventListener(UP_EVENT_NAME, bindFnMouseUp.current);
      bindFnMouseUp.current = null;
    }
  }, [bindFnMouseMove, bindFnMouseUp]);

  const fnMouseUp = () => {
    startPosition.current = null;
    lastOffset.current = [...currentOffsetOnTime.current];
    clearEvents();
  };

  const fnMouseDown: MouseEventHandler<HTMLElement> = ev => {
    ev.preventDefault();

    startPosition.current = [ev.clientX, ev.clientY];

    document.addEventListener(MOVE_EVENT_NAME, fnMouseMove);
    document.addEventListener(UP_EVENT_NAME, fnMouseUp);
    bindFnMouseMove.current = fnMouseMove;
    bindFnMouseUp.current = fnMouseUp;
  };

  // 移除事件
  useEffect(() => {
    return () => {
      clearEvents();
    };
  }, []);

  return {
    events: {
      onPointerDown: fnMouseDown,
    } satisfies DOMAttributes<HTMLElement>,
  };
};
