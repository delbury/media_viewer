import { useCallback, useRef } from 'react';

// 手势触点信息
interface GesturePointerInfos {
  // key: pointerId
  // 触点的位置，可能有多个，比如双击
  [pointerId: string]: {
    down: [number, number];
    up?: [number, number];
  };
}

type GestureType = 'single-down' | 'single-click' | 'double-down' | 'unknown';
export interface DetectGestureResult {
  pointerInfos: GesturePointerInfos;
  type: GestureType;
}

const resolveGestureType = (infos: GesturePointerInfos): GestureType => {
  const keys = Object.keys(infos);
  // 单点
  if (keys.length === 1) {
    // click
    if (infos[keys[0]].up) return 'single-click';
    // 只是按下
    return 'single-down';
  }

  // 双点
  if (keys.length === 2) {
    // 只是按下
    if (!infos[keys[0]].up && !infos[keys[1]].up) return 'double-down';
  }
  return 'unknown';
};

// 默认防抖时间
const DEFAULT_DEBOUNCE_TIME = 20;

export const useGesture = () => {
  // 手势开始
  const recordingTimeout = useRef<number>(null);
  // 记录按下的事件信息
  const gestureInfo = useRef<GesturePointerInfos>({});

  // 检测手势
  const detectGesture = useCallback(async (ev: React.PointerEvent<HTMLElement>) => {
    if (ev.type === 'pointerdown') {
      // 触点按下事件

      // 添加触点信息
      gestureInfo.current[ev.pointerId] = {
        down: [ev.clientX, ev.clientY],
      };

      // 在手势检测状态中
      if (!recordingTimeout.current) {
        return new Promise<DetectGestureResult>(resolve => {
          recordingTimeout.current = window.setTimeout(() => {
            // 完成一次手势
            resolve({
              pointerInfos: { ...gestureInfo.current },
              type: resolveGestureType(gestureInfo.current),
            });
            // 清空
            recordingTimeout.current = null;
            gestureInfo.current = {};
          }, DEFAULT_DEBOUNCE_TIME);
        });
      }
    } else if (ev.type === 'pointerup') {
      // 触点抬起事件

      if (recordingTimeout.current && gestureInfo.current[ev.pointerId]) {
        gestureInfo.current[ev.pointerId].up = [ev.clientX, ev.clientY];
      }
    }
    // 在一次手势检测中，未完成手势
    return null;
  }, []);

  return {
    detectGesture,
  };
};
