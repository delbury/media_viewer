'use client';

import { MouseEventHandler, useEffect, useRef } from 'react';

interface UseDragParams {
  callback: (offset: [number, number]) => void | false;
  watchAxis?: 'both' | 'x' | 'y';
  // 外部传入的初始累积偏移值
  defaultOffset?: [number, number];
}

export const useDrag = ({ callback, watchAxis = 'both', defaultOffset }: UseDragParams) => {
  const timer = useRef<number>(null);
  // 鼠标点击的原点
  const startPosition = useRef<[number, number]>(null);
  // 累积的偏移，用于多次拖拽的累积计算
  const lastOffset = useRef<[number, number]>(defaultOffset ?? [0, 0]);
  // 当次拖拽时，鼠标相对于点击原点的实时偏移值
  const currentOffsetOnTime = useRef<[number, number]>([0, 0]);

  const fnMouseMove = (ev: MouseEvent) => {
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
    if (!timer.current) {
      timer.current = window.setTimeout(() => {
        timer.current = null;

        const flag = callback([dx, dy]);
        if (flag === false) return;

        currentOffsetOnTime.current = [dx, dy];
      }, 10);
    }
  };

  const fnMouseUp = () => {
    startPosition.current = null;
    lastOffset.current = [...currentOffsetOnTime.current];
    document.removeEventListener('mousemove', fnMouseMove);
    document.removeEventListener('mouseup', fnMouseUp);
  };

  const fnMouseDown: MouseEventHandler<HTMLElement> = ev => {
    ev.preventDefault();

    startPosition.current = [ev.clientX, ev.clientY];

    document.addEventListener('mousemove', fnMouseMove);
    document.addEventListener('mouseup', fnMouseUp);
  };

  // 移除事件
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', fnMouseMove);
      document.removeEventListener('mouseup', fnMouseUp);
    };
  }, []);

  return {
    events: {
      onMouseDown: fnMouseDown,
    },
  };
};
