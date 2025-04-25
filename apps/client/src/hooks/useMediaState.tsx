import { noop } from 'lodash-es';
import { RefObject, useCallback, useState } from 'react';

interface UseMediaPlayBtn {
  mediaRef: RefObject<HTMLAudioElement | null>;
}

export const useMediaState = ({ mediaRef }: UseMediaPlayBtn) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleToggle = useCallback(() => {
    if (!mediaRef.current) return;
    if (mediaRef.current.paused) {
      mediaRef.current.play().catch(noop);
      setIsPlaying(true);
    } else {
      mediaRef.current.pause();
      setIsPlaying(false);
    }
  }, [mediaRef]);

  return {
    isPlaying,
    toggle: handleToggle,
  };
};
