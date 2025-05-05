import { RefObject, useEffect } from 'react';

interface UseWebVttParams {
  vtt?: string;
  mediaRef: RefObject<HTMLMediaElement | null>;
}

const createTrack = (vtt: string) => {
  const blob = new Blob([vtt], { type: 'text/vtt' });
  const url = URL.createObjectURL(blob);

  const track = document.createElement('track');
  track.kind = 'subtitles';
  track.src = url;
  track.default = true;

  return { track, url };
};

export const useWebVtt = ({ mediaRef, vtt }: UseWebVttParams) => {
  useEffect(() => {
    const elm = mediaRef.current as HTMLVideoElement;
    if (!vtt || !elm) return;

    const { track, url } = createTrack(vtt);
    elm.appendChild(track);

    return () => {
      track.remove();
      URL.revokeObjectURL(url);
    };
  }, [mediaRef, vtt]);
};
