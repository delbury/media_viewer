import {
  DirectoryInfo,
  FileInfo,
  TraverseDirectoriesReturnValue,
} from '../tools/traverseDirectories';

export interface ApiResponseBase<T = unknown> {
  msg?: string;
  code: number;
  data?: T;
}

type DirUpdateData = TraverseDirectoriesReturnValue;
export type { DirectoryInfo, DirUpdateData, FileInfo };

export type FullFileType = 'image' | 'audio' | 'video' | 'text' | 'other';
