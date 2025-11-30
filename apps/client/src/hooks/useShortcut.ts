import { stopPropagation } from '#/utils';
import { isNil } from 'lodash-es';
import { useEffect } from 'react';

enum BoardKey {
  Escape = 'Escape',
  ArrowLeft = 'ArrowLeft',
  ArrowRight = 'ArrowRight',
  ArrowUp = 'ArrowUp',
  ArrowDown = 'ArrowDown',
  Space = 'Space',
  Enter = 'Enter',
  Backspace = 'Backspace',
  A = 'KeyA',
  D = 'KeyD',
  W = 'KeyW',
  S = 'KeyS',
  F = 'KeyF',
  X = 'KeyX',
}

enum EventType {
  Pressed,
  Released,
}

interface UseShortcutParams {
  onEscPressed?: (ev: KeyboardEvent) => void;
  onLeftPressed?: (ev: KeyboardEvent) => void;
  onRightPressed?: (ev: KeyboardEvent) => void;
  onUpPressed?: (ev: KeyboardEvent) => void;
  onDownPressed?: (ev: KeyboardEvent) => void;
  onSpacePressed?: (ev: KeyboardEvent) => void;
  onEnterPressed?: (ev: KeyboardEvent) => void;
  onBackspacePressed?: (ev: KeyboardEvent) => void;
  onFPressed?: (ev: KeyboardEvent) => void;
  onFReleased?: (ev: KeyboardEvent) => void;
  onXPressed?: (ev: KeyboardEvent) => void;
  eventOption?: EventItem['option'];
  arrowKeyAliasEnabled?: boolean;
}

// 单例
interface EventItem {
  callback: (ev: KeyboardEvent) => void;
  option?: { stopWhenFirstCalled?: boolean };
}
const GLOBAL_STATE = {
  eventController: null as AbortController | null,
  pressedEvents: {} as Record<BoardKey, Set<EventItem>>,
  releasedEvents: {} as Record<BoardKey, Set<EventItem>>,
};

// 全局回调
const keyboardPressedCallback = (ev: KeyboardEvent, type: EventType) => {
  const events = (
    type === EventType.Pressed
      ? GLOBAL_STATE.pressedEvents
      : type === EventType.Released
        ? GLOBAL_STATE.releasedEvents
        : null
  )?.[ev.code as BoardKey];

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

// const removeGlobalListener = () => {
//   // 无事件后，移除
//   if (Object.values(GLOBAL_STATE.events).every(v => !v.size)) {
//     GLOBAL_STATE.eventController?.abort();
//     GLOBAL_STATE.eventController = null;
//   }
// };

const useBindKeyEvent = (
  key: BoardKey,
  cb?: (ev: KeyboardEvent) => void,
  {
    eventOption,
    type = EventType.Pressed,
  }: { eventOption?: EventItem['option']; type?: EventType } = {}
) => {
  useEffect(() => {
    if (!cb) return;

    const eventField: keyof Pick<typeof GLOBAL_STATE, 'pressedEvents' | 'releasedEvents'> | null =
      type === EventType.Pressed
        ? 'pressedEvents'
        : type === EventType.Released
          ? 'releasedEvents'
          : null;

    if (isNil(eventField)) return;

    // 添加事件回调
    if (!GLOBAL_STATE[eventField][key]) GLOBAL_STATE[eventField][key] = new Set();

    const item: EventItem = {
      callback: cb,
      option: {
        stopWhenFirstCalled: eventOption?.stopWhenFirstCalled,
      },
    };
    GLOBAL_STATE[eventField][key].add(item);

    return () => {
      // 移除
      GLOBAL_STATE[eventField][key].delete(item);
    };
  }, [key, cb, eventOption?.stopWhenFirstCalled, type]);
};

export const useShortcut = ({
  onEscPressed,
  onLeftPressed,
  onRightPressed,
  onUpPressed,
  onDownPressed,
  onSpacePressed,
  onEnterPressed,
  onBackspacePressed,
  onFPressed,
  onFReleased,
  onXPressed,
  eventOption,
  arrowKeyAliasEnabled,
}: UseShortcutParams = {}) => {
  // 初始化，单例模式
  useEffect(() => {
    if (!GLOBAL_STATE.eventController) {
      const controller = new AbortController();
      GLOBAL_STATE.eventController = controller;

      window.addEventListener(
        'keydown',
        ev => keyboardPressedCallback(ev, EventType.Pressed),
        // 防止触发 dialog 的关闭事件
        { signal: controller.signal, capture: false }
      );

      window.addEventListener(
        'keyup',
        ev => keyboardPressedCallback(ev, EventType.Released),
        // 防止触发 dialog 的关闭事件
        { signal: controller.signal, capture: false }
      );

      return () => {
        controller.abort();
      };
    }
  }, []);

  // 上下左右
  useBindKeyEvent(BoardKey.ArrowLeft, onLeftPressed, { eventOption });
  useBindKeyEvent(BoardKey.ArrowRight, onRightPressed, { eventOption });
  useBindKeyEvent(BoardKey.ArrowUp, onUpPressed, { eventOption });
  useBindKeyEvent(BoardKey.ArrowDown, onDownPressed, { eventOption });

  // 上下左右，别名
  useBindKeyEvent(BoardKey.A, arrowKeyAliasEnabled ? onLeftPressed : void 0, { eventOption });
  useBindKeyEvent(BoardKey.D, arrowKeyAliasEnabled ? onRightPressed : void 0, { eventOption });
  useBindKeyEvent(BoardKey.W, arrowKeyAliasEnabled ? onUpPressed : void 0, { eventOption });
  useBindKeyEvent(BoardKey.S, arrowKeyAliasEnabled ? onDownPressed : void 0, { eventOption });

  useBindKeyEvent(BoardKey.F, onFPressed, { eventOption });
  useBindKeyEvent(BoardKey.F, onFReleased, { eventOption, type: EventType.Released });
  useBindKeyEvent(BoardKey.X, onXPressed, { eventOption });

  useBindKeyEvent(BoardKey.Escape, onEscPressed, { eventOption });
  useBindKeyEvent(BoardKey.Space, onSpacePressed, { eventOption });
  useBindKeyEvent(BoardKey.Enter, onEnterPressed, { eventOption });
  useBindKeyEvent(BoardKey.Backspace, onBackspacePressed, { eventOption });
};
