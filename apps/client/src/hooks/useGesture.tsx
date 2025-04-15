import { useCallback, useRef } from 'react';

// 默认防抖时间
const DEFAULT_DEBOUNCE_TIME = 10;

export const useGesture = () => {
  // 手势开始
  const recordingTimeout = useRef<number>(null);
  // 记录时间内按下的指针数
  const pointerIds = useRef(new Set<number>());

  const detectGesture = useCallback(
    async (ev: React.PointerEvent<HTMLElement>) => {
      if (recordingTimeout.current) {
        // 在一次手势检测中
        pointerIds.current.add(ev.pointerId);
        return null;
      } else {
        // 开始检测
        pointerIds.current.add(ev.pointerId);
        return new Promise<number[]>(resolve => {
          recordingTimeout.current = window.setTimeout(() => {
            // 完成一次手势
            resolve([...pointerIds.current]);
            // 清空
            recordingTimeout.current = null;
            pointerIds.current.clear();
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
