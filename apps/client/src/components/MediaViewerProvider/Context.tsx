'use client';

import { DirectoryInfo, FileInfo } from '#pkgs/apis';
import { MediaFileType } from '#pkgs/shared';
import { noop } from 'lodash-es';
import { createContext } from 'react';
import { RandomPlayStrategy } from '../GlobalSetting';

export const INIT_VALUE: MediaContextState = {
  dir: void 0,
  file: void 0,
  list: void 0,
  mediaType: void 0,
  randomStrategy: void 0,
  noFileDetailPathDirClickEvent: void 0,
};

export interface MediaContextState {
  mediaType?: MediaFileType;
  file?: FileInfo;
  dir?: DirectoryInfo;
  list?: FileInfo[];
  // 随机播放的策略
  randomStrategy?: RandomPlayStrategy;
  // 无文件详情的路径文件夹点击事件
  noFileDetailPathDirClickEvent?: boolean;
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
