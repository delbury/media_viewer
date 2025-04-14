import { FileInfo } from '#pkgs/apis';
import { FullFileType } from '#pkgs/shared';
import React, { useMemo, useState } from 'react';
import AudioViewer from '../AudioViewer';
import VideoViewer from '../VideoViewer';
import { MediaContext, MediaContextState } from './Context';

const INIT_VALUE: MediaContextState = {
  file: null,
  mediaType: null,
};

const MediaViewerProvider = ({ children }: { children?: React.ReactNode }) => {
  const [state, setState] = useState(INIT_VALUE);

  const value = useMemo(
    () => ({
      state,
      setState,
    }),
    [state, setState]
  );

  const show = useMemo(() => {
    const flags: Record<Extract<FullFileType, 'audio' | 'video'>, boolean> = {
      audio: false,
      video: false,
    };
    if (!state.file) return flags;
    switch (state.mediaType) {
      case 'audio':
        flags.audio = true;
        break;
      case 'video':
        flags.video = true;
        break;
    }
    return flags;
  }, [state.file, state.mediaType]);

  return (
    <MediaContext.Provider value={value}>
      {children}
      {show.audio && (
        <AudioViewer
          visible
          file={state.file as FileInfo}
          onClose={() => setState(INIT_VALUE)}
        />
      )}

      {show.video && (
        <VideoViewer
          visible
          file={state.file as FileInfo}
          onClose={() => setState(INIT_VALUE)}
        />
      )}
    </MediaContext.Provider>
  );
};

export default MediaViewerProvider;
