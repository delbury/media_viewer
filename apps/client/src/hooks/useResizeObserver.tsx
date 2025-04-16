import { RefObject, useEffect, useRef, useState } from 'react';

interface UseResizeObserverParams {
  domRef: RefObject<HTMLElement | null>;
}

export const useResizeObserver = ({ domRef }: UseResizeObserverParams) => {
  const observer = useRef<ResizeObserver>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (domRef.current) {
      observer.current = new ResizeObserver(entries => {
        setSize({
          width: entries[0].contentBoxSize[0].inlineSize,
          height: entries[0].contentBoxSize[0].blockSize,
        });
      });

      observer.current.observe(domRef.current);

      return () => {
        observer.current?.disconnect();
      };
    }
  }, [domRef]);

  return {
    size,
  };
};
