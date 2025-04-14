import { MediaContext } from '#/components/MediaViewerProvider/Context';
import { useContext } from 'react';

export const useMediaViewerContext = () => {
  const { state, setState } = useContext(MediaContext);

  return {
    mediaState: state,
    openMediaViewer: setState,
  };
};
