// 文件路径变更事件
export const FILE_PATH_CHANGE_EVENT = 'customFilePathChange';

type CustomEventName = typeof FILE_PATH_CHANGE_EVENT;

interface CustomEventDataMap {
  customFilePathChange: string[];
}

const eventBus = new EventTarget();

export const useCustomEvent = () => {
  // 触发事件
  const emit = <T extends CustomEventName>(eventName: T, payload: CustomEventDataMap[T]) => {
    const customEvent = new CustomEvent<CustomEventDataMap[T]>(eventName, {
      detail: payload,
    });
    eventBus.dispatchEvent(customEvent);
  };

  // 绑定、解绑事件
  const on = <T extends CustomEventName>(
    eventName: T,
    cb: (payload?: CustomEventDataMap[T]) => void
  ) => {
    const controller = new AbortController();
    eventBus.addEventListener(
      eventName,
      (ev: CustomEventInit<CustomEventDataMap[T]>) => {
        cb(ev.detail);
      },
      { signal: controller.signal }
    );

    return () => {
      controller.abort();
    };
  };

  return {
    emit,
    on,
  };
};
