import { DirectoryInfo, TraverseDirectoriesReturnValue } from '../tools/traverseDirectories';

export interface ApiResponseBase<T = unknown> {
  msg?: string;
  code: number;
  data?: T;
}

type DirUpdateData = TraverseDirectoriesReturnValue;
export type { DirectoryInfo, DirUpdateData };
