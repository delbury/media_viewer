import { stopPropagation } from '#/utils';
import { useEffect, useRef } from 'react';

enum KEY {
  Escape = 'Escape',
}

interface UseShortcutParams {
  // 当命中快捷键时，阻止冒泡
  stopPropagationWhenHit?: boolean;
  onEscPressed?: (ev: KeyboardEvent) => void;
}

export const useShortcut = ({
  stopPropagationWhenHit = true,
  onEscPressed,
}: UseShortcutParams = {}) => {
  const keydownController = useRef<AbortController>(null);

  useEffect(() => {
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
      { signal: controller.signal, capture: true }
    );

    return () => {
      keydownController.current?.abort();
      keydownController.current = null;
    };
  }, []);
};
