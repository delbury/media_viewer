import { RefObject, useEffect, useRef, useState } from 'react';

interface UseResizeObserverParams {
  domRef: RefObject<HTMLElement | null>;
  // 自定义元素
  findDom?: (dom: HTMLElement) => HTMLElement | null;
}

export const useResizeObserver = ({ domRef, findDom }: UseResizeObserverParams) => {
  const observer = useRef<ResizeObserver>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (!domRef.current) return;

    const elm = findDom ? findDom(domRef.current) : domRef.current;
    if (!elm) return;

    observer.current = new ResizeObserver(entries => {
      setSize({
        width: entries[0].contentBoxSize[0].inlineSize,
        height: entries[0].contentBoxSize[0].blockSize,
      });
    });

    observer.current.observe(elm);

    return () => {
      observer.current?.disconnect();
    };
  }, [domRef]);

  return {
    size,
  };
};
