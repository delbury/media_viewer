'use client';

import React, { useMemo, useState } from 'react';
import AudioViewer from '../AudioViewer';
import ImageViewer from '../ImageViewer';
import VideoViewer from '../VideoViewer';
import { INIT_VALUE, MediaContext, MediaContextState } from './Context';
import { useFileOrDirectory } from './useFileOrDirectory';

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
    if (!state.file && !state.dir) return flags;
    if (state.mediaType) flags[state.mediaType] = true;
    return flags;
  }, [state.dir, state.file, state.mediaType]);

  const {
    currentFile,
    isList,
    goNextFile,
    goPrevFile,
    lastDisabled,
    firstDisabled,
    toggleRandom,
    isRandomPlay,
  } = useFileOrDirectory({
    file: state.file,
    dir: state.dir,
    mediaType: state.mediaType,
  });

  return (
    <MediaContext.Provider value={value}>
      {children}

      {show.image && (
        <ImageViewer
          visible
          file={currentFile}
          isList={isList}
          lastDisabled={lastDisabled}
          firstDisabled={firstDisabled}
          isRandomPlay={isRandomPlay}
          onNext={goNextFile}
          onPrev={goPrevFile}
          onToggleRandom={toggleRandom}
          onClose={() => setState(INIT_VALUE)}
        />
      )}

      {show.audio && (
        <AudioViewer
          visible
          file={currentFile}
          isList={isList}
          lastDisabled={lastDisabled}
          firstDisabled={firstDisabled}
          isRandomPlay={isRandomPlay}
          onNext={goNextFile}
          onPrev={goPrevFile}
          onToggleRandom={toggleRandom}
          onClose={() => setState(INIT_VALUE)}
        />
      )}

      {show.video && (
        <VideoViewer
          visible
          file={currentFile}
          isList={isList}
          lastDisabled={lastDisabled}
          firstDisabled={firstDisabled}
          isRandomPlay={isRandomPlay}
          onNext={goNextFile}
          onPrev={goPrevFile}
          onToggleRandom={toggleRandom}
          onClose={() => setState(INIT_VALUE)}
        />
      )}
    </MediaContext.Provider>
  );
};

export default MediaViewerProvider;
