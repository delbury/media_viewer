import { stopPropagation } from '#/utils';
import { useEffect } from 'react';

enum BoardKey {
  Escape = 'Escape',
  ArrowLeft = 'ArrowLeft',
  ArrowRight = 'ArrowRight',
  ArrowUp = 'ArrowUp',
  ArrowDown = 'ArrowDown',
  Space = 'Space',
  Enter = 'Enter',
}

interface UseShortcutParams {
  onEscPressed?: (ev: KeyboardEvent) => void;
  onLeftPressed?: (ev: KeyboardEvent) => void;
  onRightPressed?: (ev: KeyboardEvent) => void;
  onUpPressed?: (ev: KeyboardEvent) => void;
  onDownPressed?: (ev: KeyboardEvent) => void;
  onSpacePressed?: (ev: KeyboardEvent) => void;
  onEnterPressed?: (ev: KeyboardEvent) => void;
  eventOption?: EventItem['option'];
}

// 单例
interface EventItem {
  callback: (ev: KeyboardEvent) => void;
  option?: { stopWhenFirstCalled?: boolean };
}
const GLOBAL_STATE = {
  eventController: null as AbortController | null,
  events: {} as Record<BoardKey, Set<EventItem>>,
};

// 全局回调
const keyboardCallback = (ev: KeyboardEvent) => {
  const events = GLOBAL_STATE.events[ev.code as BoardKey];
  if (events?.size) {
    stopPropagation(ev);
    const list = [...events];
    // 先绑定后执行
    for (let i = list.length - 1; i >= 0; i--) {
      const item = list[i];
      item.callback(ev);
      if (item.option?.stopWhenFirstCalled) break;
    }
  }
};

const removeGlobalListener = () => {
  // 无事件后，移除
  if (Object.values(GLOBAL_STATE.events).every(v => !v.size)) {
    GLOBAL_STATE.eventController?.abort();
    GLOBAL_STATE.eventController = null;
  }
};

const useBindKeyEvent = (
  key: BoardKey,
  cb?: (ev: KeyboardEvent) => void,
  { eventOption }: { eventOption?: EventItem['option'] } = {}
) => {
  useEffect(() => {
    if (!cb) return;

    // 添加事件回调
    if (!GLOBAL_STATE.events[key]) GLOBAL_STATE.events[key] = new Set();

    const item: EventItem = {
      callback: cb,
      option: {
        stopWhenFirstCalled: eventOption?.stopWhenFirstCalled,
      },
    };
    GLOBAL_STATE.events[key].add(item);

    return () => {
      // 移除
      GLOBAL_STATE.events[key].delete(item);
      removeGlobalListener();
    };
  }, [key, cb, eventOption?.stopWhenFirstCalled]);
};

export const useShortcut = ({
  onEscPressed,
  onLeftPressed,
  onRightPressed,
  onUpPressed,
  onDownPressed,
  onSpacePressed,
  onEnterPressed,
  eventOption,
}: UseShortcutParams = {}) => {
  // 初始化，单例模式
  useEffect(() => {
    if (!GLOBAL_STATE.eventController) {
      const controller = new AbortController();
      window.addEventListener(
        'keydown',
        keyboardCallback,
        // 防止触发 dialog 的关闭事件
        { signal: controller.signal, capture: false }
      );

      GLOBAL_STATE.eventController = controller;
    }
  }, []);

  useBindKeyEvent(BoardKey.Escape, onEscPressed, { eventOption });
  useBindKeyEvent(BoardKey.ArrowLeft, onLeftPressed, { eventOption });
  useBindKeyEvent(BoardKey.ArrowRight, onRightPressed, { eventOption });
  useBindKeyEvent(BoardKey.ArrowUp, onUpPressed, { eventOption });
  useBindKeyEvent(BoardKey.ArrowDown, onDownPressed, { eventOption });
  useBindKeyEvent(BoardKey.Space, onSpacePressed, { eventOption });
  useBindKeyEvent(BoardKey.Enter, onEnterPressed, { eventOption });
};
