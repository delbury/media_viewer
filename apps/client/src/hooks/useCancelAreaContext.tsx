import { CancelAreaContext } from '#/components/CancelAreaProvider/Context';
import {
  DOMAttributes,
  MouseEventHandler,
  TouchEventHandler,
  useCallback,
  useContext,
} from 'react';
import { useThrottle } from './useThrottle';

interface UseCancelAreaContextParams {
  onActivatedCallback: MouseEventHandler<HTMLElement>;
}

export const useCancelAreaContext = ({ onActivatedCallback }: UseCancelAreaContextParams) => {
  const { visible, setVisible, areaSize, activated, setActivated } = useContext(CancelAreaContext);

  const openCancelArea = useCallback(() => setVisible(true), [setVisible]);
  const closeCancelArea = useCallback(() => {
    setVisible(false);
    setActivated(false);
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
  const handleTouchMove = useCallback<TouchEventHandler<HTMLElement>>(
    ev => {
      const { clientX, clientY } = ev.targetTouches[0];
      detectIfActivated([clientX, clientY]);
      openCancelArea();
    },
    [detectIfActivated, openCancelArea]
  );
  const handleTouchMoveThrottle = useThrottle(handleTouchMove, {
    byAnimationFrame: true,
    notCacheLastCall: true,
  });

  // 移动端触发，结束事件
  const handleLostPointerCapture = useCallback<MouseEventHandler<HTMLElement>>(
    ev => {
      if (!detectIfActivated([ev.clientX, ev.clientY])) {
        onActivatedCallback?.(ev);
      }
      closeCancelArea();
    },
    [closeCancelArea, detectIfActivated, onActivatedCallback]
  );

  return {
    cancelAreaActivated: activated,
    cancelAreaVisible: visible,
    openCancelArea,
    closeCancelArea,
    activateCancelArea,
    deactivateCancelArea,
    detectIfActivated,
    events: {
      onTouchMove: handleTouchMoveThrottle,
      onLostPointerCapture: handleLostPointerCapture,
    } satisfies Pick<DOMAttributes<HTMLElement>, 'onTouchMove' | 'onLostPointerCapture'>,
  };
};
