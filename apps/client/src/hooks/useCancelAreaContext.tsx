import { CancelAreaContext } from '#/components/CancelAreaProvider/Context';
import { useCallback, useContext } from 'react';

export const useCancelAreaContext = () => {
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

  return {
    cancelAreaActivated: activated,
    cancelAreaVisible: visible,
    openCancelArea,
    closeCancelArea,
    activateCancelArea,
    deactivateCancelArea,
    detectIfInArea: detectIfActivated,
  };
};
