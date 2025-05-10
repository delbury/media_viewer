import { INIT_VALUE, MediaContext } from '#/components/MediaViewerProvider/Context';
import { useCallback, useContext } from 'react';

export const useMediaViewerContext = () => {
  const { state, setState } = useContext(MediaContext);

  const handleClose = useCallback(() => setState(INIT_VALUE), [setState]);

  return {
    mediaState: state,
    openMediaViewer: setState,
    closeMediaViewer: handleClose,
  };
};
