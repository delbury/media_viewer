import { useEffect } from 'react';

interface UseTranslationsCallbackParams<T extends keyof HTMLElementEventMap> {
  domRef: React.RefObject<HTMLElement | null>;
  eventName: T;
  callback?: (ev: HTMLElementEventMap[T]) => void;
}

export const useEventCallback = <T extends keyof HTMLElementEventMap>({
  domRef,
  eventName,
  callback,
}: UseTranslationsCallbackParams<T>) => {
  useEffect(() => {
    const elm = domRef.current;
    if (!elm) return;

    let controller: AbortController | null = null;

    if (callback) {
      controller = new AbortController();
      elm.addEventListener(
        eventName,
        ev => {
          callback(ev);
        },
        { signal: controller.signal }
      );
    }

    return () => {
      controller?.abort();
    };
  }, [callback, domRef, eventName]);
};
