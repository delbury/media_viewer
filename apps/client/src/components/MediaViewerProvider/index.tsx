'use client';

import { FileInfo } from '#pkgs/apis';
import React, { useMemo, useState } from 'react';
import AudioViewer from '../AudioViewer';
import ImageViewer from '../ImageViewer';
import VideoViewer from '../VideoViewer';
import { MediaContext, MediaContextState } from './Context';

const INIT_VALUE: MediaContextState = {
  dir: void 0,
  file: void 0,
  mediaType: void 0,
};

const MediaViewerProvider = ({ children }: { children?: React.ReactNode }) => {
  const [state, setState] = useState(INIT_VALUE);

  const value = useMemo(
    () => ({
      state,
      setState,
    }),
    [state]
  );

  const show = useMemo(() => {
    const flags: Partial<Record<NonNullable<MediaContextState['mediaType']>, boolean>> = {};
    if (!state.file) return flags;
    if (state.mediaType) flags[state.mediaType] = true;
    return flags;
  }, [state.file, state.mediaType]);

  return (
    <MediaContext.Provider value={value}>
      {children}

      {show.image && (
        <ImageViewer
          visible
          file={state.file as FileInfo}
          onClose={() => setState(INIT_VALUE)}
        />
      )}

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
