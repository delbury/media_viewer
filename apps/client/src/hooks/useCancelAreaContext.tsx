import { CancelAreaContext, ExtraAreasConfig } from '#/components/CancelAreaProvider/Context';
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
  // 获取自定义挂载点
  getCustomContainer?: () => HTMLElement | null;
  // 显示额外区域，包括 prev 和 next 两个区域
  extraAreasConfig?: ExtraAreasConfig;
}

const calcIfHit = (areaSize: DOMRect | null, [px, py]: [number, number]) => {
  if (!areaSize) return false;
  const { left, top, width, height } = areaSize;
  if (px < left || px > left + width || py < top || py > top + height) return false;
  else return true;
};

export const useCancelAreaContext = ({
  domRef,
  onActivatedCallback,
  onFinal,
  areaSx,
  ifDisable,
  getCustomContainer,
  extraAreasConfig,
}: UseCancelAreaContextParams) => {
  // 判断是否开始
  const isStart = useRef(false);
  const {
    visible,
    setVisible,
    areaSize,
    // activated,
    setActivated,
    setAreaSx,
    setCustomContainer,
    setExtraAreasConfig,
    prevAreaSize,
    // prevActivated,
    setPrevActivated,
    nextAreaSize,
    // nextActivated,
    setNextActivated,
  } = useContext(CancelAreaContext);
  const hasCustomContainer = useRef(false);

  // 开
  const openCancelArea = useCallback(() => {
    // 获取自定义容器
    if (!hasCustomContainer.current) {
      setCustomContainer(getCustomContainer?.() ?? null);
      hasCustomContainer.current = true;
    }

    if (!isStart.current) {
      isStart.current = true;
      setAreaSx(areaSx);
    }
    setExtraAreasConfig(extraAreasConfig ?? null);
    setVisible(true);
  }, [
    areaSx,
    extraAreasConfig,
    getCustomContainer,
    setAreaSx,
    setCustomContainer,
    setExtraAreasConfig,
    setVisible,
  ]);

  // 关
  const closeCancelArea = useCallback(() => {
    setVisible(false);
    setActivated(false);
    isStart.current = false;
    hasCustomContainer.current = false;
  }, [setActivated, setVisible]);

  // const activateCancelArea = useCallback(() => setActivated(true), [setActivated]);
  // const deactivateCancelArea = useCallback(() => setActivated(false), [setActivated]);

  // 检测是否激活
  const detectIfActivated = useCallback(
    (pos: [number, number]) => {
      const mainFlag = calcIfHit(areaSize, pos);
      setActivated(mainFlag);

      const prevFlag = calcIfHit(prevAreaSize, pos);
      setPrevActivated(prevFlag);

      const nextFlag = calcIfHit(nextAreaSize, pos);
      setNextActivated(nextFlag);

      return { mainFlag, prevFlag, nextFlag };
    },
    [areaSize, nextAreaSize, prevAreaSize, setActivated, setNextActivated, setPrevActivated]
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
      if (!visible) {
        onFinal?.();
        return;
      }
      const { mainFlag, prevFlag, nextFlag } = detectIfActivated([ev.clientX, ev.clientY]);
      // 主区域为取消区域，即命中则不执行
      if (!mainFlag && !prevFlag && !nextFlag) onActivatedCallback?.(ev);
      // 其他区域为确定区域，即命中则执行
      if (prevFlag) extraAreasConfig?.onPrevActivatedCallback?.(ev);
      if (nextFlag) extraAreasConfig?.onNextActivatedCallback?.(ev);

      closeCancelArea();
      onFinal?.();
    },
    [visible, detectIfActivated, onActivatedCallback, extraAreasConfig, closeCancelArea, onFinal]
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
    // cancelAreaActivated: activated,
    // cancelAreaVisible: visible,
    openCancelArea,
    closeCancelArea,
    // activateCancelArea,
    // deactivateCancelArea,
  };
};
