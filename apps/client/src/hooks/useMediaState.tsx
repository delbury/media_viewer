import { DOMAttributes, ReactEventHandler, RefObject, useCallback, useState } from 'react';

interface UseMediaPlayBtn {
  mediaRef: RefObject<HTMLAudioElement | null>;
}

export const useMediaState = ({ mediaRef }: UseMediaPlayBtn) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleToggle = useCallback(() => {
    if (!mediaRef.current) return;
    if (mediaRef.current.paused) {
      mediaRef.current.play();
    } else {
      mediaRef.current.pause();
    }
  }, [mediaRef]);

  const handlePlay = useCallback<ReactEventHandler<HTMLVideoElement>>(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback<ReactEventHandler<HTMLVideoElement>>(() => {
    setIsPlaying(false);
  }, []);

  return {
    isPlaying,
    toggle: handleToggle,
    events: {
      onPlay: handlePlay,
      onPause: handlePause,
    } as Pick<DOMAttributes<HTMLVideoElement>, 'onPlay' | 'onPause'>,
  };
};
