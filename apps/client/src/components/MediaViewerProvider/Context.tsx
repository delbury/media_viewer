import { FileInfo } from '#pkgs/apis';
import { FullFileType } from '#pkgs/shared';
import { noop } from 'lodash-es';
import { createContext } from 'react';

export interface MediaContextState {
  mediaType: Extract<FullFileType, 'audio' | 'video'> | null;
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
