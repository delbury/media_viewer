'use client';

import { DirectoryInfo, FileInfo } from '#pkgs/apis';
import { MediaFileType } from '#pkgs/shared';
import { noop } from 'lodash-es';
import { createContext } from 'react';

export const INIT_VALUE: MediaContextState = {
  dir: void 0,
  file: void 0,
  mediaType: void 0,
};

export interface MediaContextState {
  mediaType?: MediaFileType;
  file?: FileInfo;
  dir?: DirectoryInfo;
}

interface MediaContextValue {
  state: MediaContextState;
  setState: (val: MediaContextState) => void;
  goNextFile: (val?: number) => void;
}

export const MediaContext = createContext<MediaContextValue>({
  state: {
    ...INIT_VALUE,
  },
  setState: noop,
  goNextFile: noop,
});
