import { useCallback, useRef } from 'react';

// 手势开始的触点
export type GestureStartPointer = [number, [number, number]];

// 默认防抖时间
const DEFAULT_DEBOUNCE_TIME = 20;

export const useGesture = () => {
  // 手势开始
  const recordingTimeout = useRef<number>(null);
  // 记录时间内按下的指针数
  const pointerIds = useRef(new Set<number>());
  // 记录按下的事件信息
  const pointerEvents = useRef(new Map<GestureStartPointer[0], GestureStartPointer[1]>());

  const detectGesture = useCallback(
    async (ev: React.PointerEvent<HTMLElement>) => {
      if (recordingTimeout.current) {
        // 在一次手势检测中
        pointerIds.current.add(ev.pointerId);
        pointerEvents.current.set(ev.pointerId, [ev.clientX, ev.clientY]);
        return null;
      } else {
        // 开始检测
        pointerIds.current.add(ev.pointerId);
        pointerEvents.current.set(ev.pointerId, [ev.clientX, ev.clientY]);
        return new Promise<GestureStartPointer[]>(resolve => {
          recordingTimeout.current = window.setTimeout(() => {
            // 完成一次手势
            resolve([...pointerEvents.current]);
            // 清空
            recordingTimeout.current = null;
            pointerIds.current.clear();
            pointerEvents.current.clear();
          }, DEFAULT_DEBOUNCE_TIME);
        });
      }
    },
    [recordingTimeout, pointerIds]
  );

  return {
    detectGesture,
  };
};
