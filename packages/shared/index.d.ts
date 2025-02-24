import { TraverseDirectoriesReturnValue } from '../tools/traverseDirectories';

export interface ApiResponseBase<T = unknown> {
  msg?: string;
  code: number;
  data?: T;
}

export type DirUpdateDate = TraverseDirectoriesReturnValue;
