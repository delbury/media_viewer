'use client';

import { DirectoryInfo, FileInfo } from '#pkgs/apis';
import { MediaFileType } from '#pkgs/shared';
import { noop } from 'lodash-es';
import { createContext } from 'react';

export interface MediaContextState {
  mediaType?: MediaFileType;
  file?: FileInfo;
  dir?: DirectoryInfo;
}

interface MediaContextValue {
  state: MediaContextState;
  setState: (val: MediaContextState) => void;
}

export const MediaContext = createContext<MediaContextValue>({
  state: {
    mediaType: void 0,
    file: void 0,
    dir: void 0,
  },
  setState: noop,
});
