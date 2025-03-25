import { RefObject, useEffect } from 'react';

export const useEvents = ({
  wrapperRef,
  disabled,
  resizeCallback,
  scrollCallback,
  childChangeCallback,
}: {
  wrapperRef: RefObject<HTMLElement | null>;
  disabled?: boolean;
  childChangeCallback: (elm: HTMLElement) => void;
  resizeCallback: (elm: HTMLElement) => void;
  scrollCallback: (elm: HTMLElement) => void;
}) => {
  useEffect(() => {
    if (disabled) {
      return;
    }
    if (wrapperRef.current) {
      const elm = wrapperRef.current;

      // 监听判断是否出现滚动条
      // 子元素的改变
      const mutationObserver = new MutationObserver(() => {
        childChangeCallback(elm);
      });
      mutationObserver.observe(elm, {
        subtree: true,
        childList: true,
      });

      // 自身 size 的改变
      const resizeObserver = new ResizeObserver(() => {
        resizeCallback(elm);
      });
      resizeObserver.observe(elm);

      // 滚动事件
      const controller = new AbortController();
      elm.addEventListener('scroll', () => scrollCallback(elm), { signal: controller.signal });

      // 解绑事件
      return () => {
        controller.abort();
        mutationObserver.disconnect();
        resizeObserver.disconnect();
      };
    }
  }, []);
};
