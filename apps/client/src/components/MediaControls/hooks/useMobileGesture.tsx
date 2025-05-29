import { useCancelAreaContext } from '#/hooks/useCancelAreaContext';
import { useDrag } from '#/hooks/useDrag';
import { useGesture } from '#/hooks/useGesture';
import { formatTime, preventDefault } from '#/utils';
import { SxProps, Theme } from '@mui/material';
import { isNil } from 'lodash-es';
import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MAX_RATE } from '../components/RateSetting';
import { bindEvent, findFullscreenRoot } from '../util';

// 在 video 上拖动时，每像素的偏移时间
export const PROGRESS_DRAG_PER_PX = 0.1;
// 判断在 video 上拖拽的方向时的最小距离的平方
export const DRAG_DIR_MIN_DISTANCE = 5 ** 2;
// 取消区域的样式
export const CANCEL_AREA_SX: SxProps<Theme> = {
  marginTop: '72px',
};

interface UseMobileDragParams {
  mediaRef: RefObject<HTMLMediaElement | null>;
  handleGoBy: (dir: 1 | -1, diff?: number) => void;
  handlePrev?: () => void;
  handleNext?: () => void;
  showExtraAreas?: boolean;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
}

export const useMobileGesture = ({
  mediaRef,
  handleGoBy,
  handlePrev,
  handleNext,
  showExtraAreas,
  prevDisabled,
  nextDisabled,
}: UseMobileDragParams) => {
  // 拖拽方向
  const currentDragDirection = useRef<'x' | 'y' | null>(null);
  // 判断当前拖拽距离
  const currentDragOffsetInstant = useRef<[number, number] | null>(null);
  const [currentDragOffset, setCurrentDragOffset] = useState<[number, number] | null>(null);
  // 之前的播放速度
  const lastRate = useRef<number>(null);

  // 重置
  const handleResetDrag = useCallback(() => {
    currentDragDirection.current = null;
    currentDragOffsetInstant.current = null;
    setCurrentDragOffset(null);
  }, []);

  // 拖拽结束
  const handleDragEnd = useCallback(() => {
    if (currentDragDirection.current === 'x' && currentDragOffsetInstant.current) {
      const diffTime = currentDragOffsetInstant.current[0] * PROGRESS_DRAG_PER_PX;
      handleGoBy(1, diffTime);
    }
    handleResetDrag();
  }, [handleGoBy, handleResetDrag]);

  // 拖拽中
  const handleDrag = useCallback((offset: [number, number]) => {
    if (!currentDragDirection.current && offset[0] ** 2 + offset[1] ** 2 >= DRAG_DIR_MIN_DISTANCE) {
      currentDragDirection.current = Math.abs(offset[0]) > Math.abs(offset[1]) ? 'x' : 'y';
    }
    setCurrentDragOffset(offset);
    currentDragOffsetInstant.current = offset;
  }, []);

  // 手势检测
  const { detectGesture } = useGesture();

  // 拖拽 hook
  const { dragEventHandler } = useDrag({
    onlyMobile: true,
    callback: handleDrag,
    resetAtEnd: true,
  });

  // 当前拖拽跳转展示的时间信息
  const skipTimeText = useMemo(() => {
    const dir = currentDragDirection.current;
    if (!currentDragOffset || !dir) return;
    if (dir === 'x') {
      // 水平方向拖动
      const timeText = formatTime(currentDragOffset[0] * PROGRESS_DRAG_PER_PX, {
        fixed: 1,
        withSymbol: true,
      });
      return timeText;
    }
  }, [currentDragOffset]);

  // 跳转的相对时间
  const currentDragDiffTime = useMemo(() => {
    if (currentDragDirection.current !== 'x') return;
    return currentDragOffset ? currentDragOffset[0] * PROGRESS_DRAG_PER_PX : void 0;
  }, [currentDragOffset]);

  const getCustomContainer = useCallback(() => {
    return findFullscreenRoot(mediaRef.current);
  }, [mediaRef]);

  // 中途取消
  const ifDisableDrag = useCallback(() => currentDragDirection.current !== 'x', []);
  useCancelAreaContext({
    domRef: mediaRef,
    onActivatedCallback: handleDragEnd,
    onFinal: handleResetDrag,
    areaSx: CANCEL_AREA_SX,
    ifDisable: ifDisableDrag,
    getCustomContainer,
    extraAreasConfig: {
      showExtraAreas,
      prevDisabled,
      nextDisabled,
      onPrevActivatedCallback: handlePrev,
      onNextActivatedCallback: handleNext,
    },
  });

  // 事件绑定
  useEffect(() => {
    const elm = mediaRef.current;
    if (!elm) return;
    const isVideoMedia = elm instanceof HTMLVideoElement;

    // 禁用菜单
    const contextmenuController = bindEvent(elm, 'contextmenu', preventDefault);

    // 阻止长按触发下载菜单
    const touchstartController = bindEvent(elm, 'touchstart', preventDefault, { passive: false });

    // 指针按下
    const pointerDownController = isVideoMedia
      ? bindEvent(elm, 'pointerdown', async ev => {
          if (ev.pointerType === 'mouse') return;
          // preventDefault(ev);
          // 当触摸开始时一段时间内命中了某个手势操作后，则不进入 drag 操作
          const gesture = await detectGesture(ev);
          // 未完成手势，跳过
          if (!gesture) return;
          // 单指拖动，进入 drag 操作
          if (gesture.type === 'single-move') dragEventHandler(ev);
          // 单指按下，进入快速播放模式
          if (gesture.type === 'single-down') {
            lastRate.current = elm.playbackRate;
            elm.playbackRate = MAX_RATE;
          }
        })
      : null;

    // 指针抬起
    const pointerUpController = isVideoMedia
      ? bindEvent(elm, 'pointerup', async ev => {
          if (ev.pointerType === 'mouse') return;
          // preventDefault(ev);
          detectGesture(ev);
          if (!isNil(lastRate.current)) {
            elm.playbackRate = lastRate.current;
            lastRate.current = null;
          }
        })
      : null;

    // 指针移动
    const pointerMoveController = isVideoMedia
      ? bindEvent(elm, 'pointermove', async ev => {
          if (ev.pointerType === 'mouse') return;
          // preventDefault(ev);
          detectGesture(ev);
        })
      : null;

    return () => {
      contextmenuController.abort();
      touchstartController.abort();
      pointerDownController?.abort();
      pointerUpController?.abort();
      pointerMoveController?.abort();
    };
  }, [detectGesture, dragEventHandler, mediaRef]);

  return {
    currentDragDiffTime,
    skipTimeText,
  };
};
