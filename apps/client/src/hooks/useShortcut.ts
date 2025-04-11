import { stopPropagation } from '#/utils';
import { useCallback, useEffect, useRef } from 'react';

enum KEY {
  Escape = 'Escape',
}

interface UseShortcutParams {
  // 当命中快捷键时，阻止冒泡
  stopPropagationWhenHit?: boolean;
  onEscPressed?: (ev: KeyboardEvent) => void;
  // 在组件挂载时不绑定事件
  lazyMount?: boolean;
}

export const useShortcut = ({
  stopPropagationWhenHit = true,
  onEscPressed,
  lazyMount,
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
        if (ev.key === KEY.Escape) {
          onEscPressed?.(ev);
          if (stopPropagationWhenHit) stopPropagation(ev);
        }
      },
      // 防止触发 dialog 的关闭事件
      { signal: controller.signal, capture: true }
    );

    return unbind;
  }, [onEscPressed, stopPropagationWhenHit, unbind]);

  useEffect(() => {
    if (!lazyMount) {
      return bind();
    }
  }, []);

  return {
    bind,
    unbind,
  };
};
