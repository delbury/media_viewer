import { stopPropagation } from '#/utils';
import { isNil } from 'lodash-es';
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
  // 绑定/解绑的触发器，不设置则在 mount 时绑定，在 unmount 时解绑
  bindTrigger?: boolean;
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
  onEscPressed,
  onLeftPressed,
  onRightPressed,
  onUpPressed,
  onDownPressed,
  onSpacePressed,
  onEnterPressed,
  ...restProps
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
        if (ev.code === KEY.Escape && onEscPressed) {
          onEscPressed(ev);
          if (stopPropagationWhenHit) stopPropagation(ev);
        } else if (ev.code === KEY.ArrowUp && onUpPressed) {
          onUpPressed(ev);
          if (stopPropagationWhenHit) stopPropagation(ev);
        } else if (ev.code === KEY.ArrowDown && onDownPressed) {
          onDownPressed(ev);
          if (stopPropagationWhenHit) stopPropagation(ev);
        } else if (ev.code === KEY.ArrowLeft && onLeftPressed) {
          onLeftPressed(ev);
          if (stopPropagationWhenHit) stopPropagation(ev);
        } else if (ev.code === KEY.ArrowRight && onRightPressed) {
          onRightPressed(ev);
          if (stopPropagationWhenHit) stopPropagation(ev);
        } else if (ev.code === KEY.Space && onSpacePressed) {
          onSpacePressed(ev);
          if (stopPropagationWhenHit) stopPropagation(ev);
        } else if (ev.code === KEY.Enter && onEnterPressed) {
          onEnterPressed(ev);
          if (stopPropagationWhenHit) stopPropagation(ev);
        }
      },
      // 防止触发 dialog 的关闭事件
      { signal: controller.signal, capture: false }
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
    const bindTrigger = restProps.bindTrigger;
    if (isNil(bindTrigger)) {
      // 直接绑定
      return bind();
    } else {
      // 外部触发绑定
      if (bindTrigger) return bind();
      else unbind();
    }
  }, [bind, restProps.bindTrigger, unbind]);

  return {
    bind,
    unbind,
  };
};
