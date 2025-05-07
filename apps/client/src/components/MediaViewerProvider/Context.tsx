'use client';

import { FileInfo } from '#pkgs/apis';
import { MediaFileType } from '#pkgs/shared';
import { noop } from 'lodash-es';
import { createContext } from 'react';

export interface MediaContextState {
  mediaType: MediaFileType | null;
  file: FileInfo | null;
}

interface MediaContextValue {
  state: MediaContextState;
  setState: (val: MediaContextState) => void;
}

export const MediaContext = createContext<MediaContextValue>({
  state: {
    mediaType: null,
    file: null,
  },
  setState: noop,
});
