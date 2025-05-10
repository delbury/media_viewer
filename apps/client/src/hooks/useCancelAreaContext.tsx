import { CancelAreaContext } from '#/components/CancelAreaProvider/Context';
import { SxProps, Theme } from '@mui/material';
import { useCallback, useContext, useEffect, useRef } from 'react';
import { useThrottle } from './useThrottle';

interface UseCancelAreaContextParams {
  domRef: React.RefObject<HTMLElement | null>;
  onActivatedCallback: (ev: PointerEvent) => void;
  onFinal?: () => void;
  areaSx?: SxProps<Theme>;
  // 是否禁用
  ifDisable?: () => boolean;
}

export const useCancelAreaContext = ({
  domRef,
  onActivatedCallback,
  onFinal,
  areaSx,
  ifDisable,
}: UseCancelAreaContextParams) => {
  // 判断是否开始
  const isStart = useRef(false);
  const { visible, setVisible, areaSize, activated, setActivated, setAreaSx } =
    useContext(CancelAreaContext);

  // 开
  const openCancelArea = useCallback(() => {
    if (!isStart.current) {
      isStart.current = true;
      setAreaSx(areaSx);
    }
    setVisible(true);
  }, [areaSx, setAreaSx, setVisible]);

  // 关
  const closeCancelArea = useCallback(() => {
    setVisible(false);
    setActivated(false);
    isStart.current = false;
  }, [setActivated, setVisible]);

  const activateCancelArea = useCallback(() => setActivated(true), [setActivated]);
  const deactivateCancelArea = useCallback(() => setActivated(false), [setActivated]);

  // 检测是否激活
  const detectIfActivated = useCallback(
    ([px, py]: [number, number]) => {
      let flag = false;
      if (areaSize) {
        const { left, top, width, height } = areaSize;
        if (px < left || px > left + width || py < top || py > top + height) flag = false;
        else flag = true;
      }
      setActivated(flag);
      return flag;
    },
    [areaSize, setActivated]
  );

  // 移动端触发，move 过程中判断
  const handleTouchMove = useCallback(
    (ev: TouchEvent) => {
      if (ifDisable?.()) return;

      const { clientX, clientY } = ev.targetTouches[0];
      detectIfActivated([clientX, clientY]);
      openCancelArea();
    },
    [detectIfActivated, ifDisable, openCancelArea]
  );
  const handleTouchMoveThrottle = useThrottle(handleTouchMove, {
    byAnimationFrame: true,
    notCacheLastCall: true,
  });

  // 结束事件
  const handleLostPointerCapture = useCallback(
    (ev: PointerEvent) => {
      if (!visible) return;
      if (!detectIfActivated([ev.clientX, ev.clientY])) {
        onActivatedCallback?.(ev);
      }
      closeCancelArea();
      onFinal?.();
    },
    [closeCancelArea, detectIfActivated, onActivatedCallback, onFinal, visible]
  );

  useEffect(() => {
    const elm = domRef.current;
    if (!elm) return;

    const moveController = new AbortController();
    const lostController = new AbortController();

    elm.addEventListener('lostpointercapture', handleLostPointerCapture, {
      signal: lostController.signal,
    });

    elm.addEventListener('touchmove', handleTouchMoveThrottle, { signal: moveController.signal });

    return () => {
      moveController.abort();
      lostController.abort();
    };
  }, [domRef, handleLostPointerCapture, handleTouchMoveThrottle]);

  return {
    cancelAreaActivated: activated,
    cancelAreaVisible: visible,
    openCancelArea,
    closeCancelArea,
    activateCancelArea,
    deactivateCancelArea,
    detectIfActivated,
  };
};
