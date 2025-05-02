import { stopPropagation } from '#/utils';
import { useCallback, useEffect, useRef } from 'react';

enum KEY {
  Escape = 'Escape',
  ArrowLeft = 'ArrowLeft',
  ArrowRight = 'ArrowRight',
  ArrowUp = 'ArrowUp',
  ArrowDown = 'ArrowDown',
  Space = 'Space',
  Enter = 'Enter',
}

interface UseShortcutParams {
  // 当命中快捷键时，阻止冒泡
  stopPropagationWhenHit?: boolean;
  // 在组件挂载时不绑定事件
  lazyMount?: boolean;
  onEscPressed?: (ev: KeyboardEvent) => void;
  onLeftPressed?: (ev: KeyboardEvent) => void;
  onRightPressed?: (ev: KeyboardEvent) => void;
  onUpPressed?: (ev: KeyboardEvent) => void;
  onDownPressed?: (ev: KeyboardEvent) => void;
  onSpacePressed?: (ev: KeyboardEvent) => void;
  onEnterPressed?: (ev: KeyboardEvent) => void;
}

export const useShortcut = ({
  stopPropagationWhenHit = true,
  lazyMount,
  onEscPressed,
  onLeftPressed,
  onRightPressed,
  onUpPressed,
  onDownPressed,
  onSpacePressed,
  onEnterPressed,
}: UseShortcutParams = {}) => {
  const keydownController = useRef<AbortController>(null);

  // 解绑
  const unbind = useCallback(() => {
    keydownController.current?.abort();
    keydownController.current = null;
  }, []);

  // 绑定
  const bind = useCallback(() => {
    unbind();

    const controller = new AbortController();
    keydownController.current = controller;

    window.addEventListener(
      'keydown',
      ev => {
        let flag = false;
        if (ev.code === KEY.Escape && onEscPressed) {
          onEscPressed(ev);
          flag = true;
        } else if (ev.code === KEY.ArrowUp && onUpPressed) {
          onUpPressed(ev);
          flag = true;
        } else if (ev.code === KEY.ArrowDown && onDownPressed) {
          onDownPressed(ev);
          flag = true;
        } else if (ev.code === KEY.ArrowLeft && onLeftPressed) {
          onLeftPressed(ev);
          flag = true;
        } else if (ev.code === KEY.ArrowRight && onRightPressed) {
          onRightPressed(ev);
          flag = true;
        } else if (ev.code === KEY.Space && onSpacePressed) {
          onSpacePressed(ev);
          flag = true;
        } else if (ev.code === KEY.Enter && onEnterPressed) {
          onEnterPressed(ev);
          flag = true;
        }
        // 阻止冒泡
        if (stopPropagationWhenHit && flag) stopPropagation(ev);
      },
      // 防止触发 dialog 的关闭事件
      { signal: controller.signal, capture: true }
    );

    return unbind;
  }, [
    onDownPressed,
    onEnterPressed,
    onEscPressed,
    onLeftPressed,
    onRightPressed,
    onSpacePressed,
    onUpPressed,
    stopPropagationWhenHit,
    unbind,
  ]);

  useEffect(() => {
    if (!lazyMount) {
      return bind();
    }
  }, [bind, lazyMount]);

  return {
    bind,
    unbind,
  };
};
