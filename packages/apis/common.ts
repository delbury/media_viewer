import {
  DirectoryInfo,
  FileInfo,
  TraverseDirectoriesReturnValue,
} from '../../apps/server/src/util/traverseDirectories';

type DirUpdateData = TraverseDirectoriesReturnValue;

export type { DirectoryInfo, DirUpdateData, FileInfo };

export type Method =
  | 'link'
  | 'head'
  | 'get'
  | 'delete'
  | 'options'
  | 'post'
  | 'put'
  | 'patch'
  | 'purge'
  | 'unlink';

export interface ApiConfig {
  url: string;
  method: Method;
}
