import { Stats } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { FullFileType } from '../shared';
import { detectFileType } from './utils';

interface CommonInfo {
  // 文件路径
  basePath?: string;
  // 文件全路径
  fullPath: string;
  // 文件名
  name: string;
  // 文件创建时间
  created: number;
  // 文件修改时间
  updated: number;
}
export interface FileInfo extends CommonInfo {
  // 文件大小
  size: number;
  // 文件名（不包含扩展名）
  namePure: string;
  // 文件扩展名（包含点）
  nameExt: string;
  // 文件扩展名（不包含点）
  nameExtPure: string;
  // 文件类型
  fileType: FullFileType;
  // 视频时长
  duration?: number;
  // [key: string]: unknown;
}
export interface DirectoryInfo extends CommonInfo {
  // 文件列表
  files: FileInfo[];
  // 子文件夹列表
  children: DirectoryInfo[];
  // 当前文件夹的文件数
  selfFilesCount: number;
  // 当前文件夹和其所有子文件夹的文件数
  totalFilesCount: number;
}
interface NewInfoParams {
  // 文件路径
  bp?: string;
  // 文件全路径
  fp?: string;
  // 文件信息
  info?: Stats;
}
const formatPath = (p: string) => p.replaceAll('\\', '/');
const newCommonInfo = ({ bp, fp, info }: NewInfoParams = {}): CommonInfo => {
  let basePath = formatPath(bp ?? '');
  if (basePath.endsWith('/')) basePath = basePath.slice(0, basePath.length - 1);

  let fullPath = formatPath(fp ?? '');
  if (fullPath) {
    fullPath = fullPath.replace(basePath, '') || '/';
  }

  return {
    basePath,
    fullPath,
    name: fp ? path.basename(fp) : '',
    created: info?.birthtimeMs ?? 0,
    updated: info?.mtimeMs ?? 0,
  };
};
const newFileInfo = (params?: NewInfoParams): FileInfo => {
  const { ext, name } = path.parse(params.fp);
  const nameExt = ext.toLowerCase();
  return {
    ...newCommonInfo(params),
    size: params?.info?.size ?? 0,
    namePure: name,
    nameExt,
    nameExtPure: nameExt.replace('.', ''),
    fileType: detectFileType(ext),
  };
};
const newDirectoryInfo = (params?: NewInfoParams): DirectoryInfo => {
  return {
    ...newCommonInfo(params),
    files: [],
    children: [],
    selfFilesCount: 0,
    totalFilesCount: 0,
  };
};

/**
 * 遍历文件夹
 * @param dir
 * @returns
 */
export const traverseDirectories = async (dir: string | string[]) => {
  // [path1, path2, dirArr, ...]
  const dirs: Array<string | DirectoryInfo> = Array.isArray(dir) ? [...dir] : [dir];
  const treeNode: DirectoryInfo = newDirectoryInfo();
  const fileList: FileInfo[] = [];
  const dirList: DirectoryInfo[] = [];
  // 当前的文件夹数组
  let currentDir: DirectoryInfo;
  dirs.unshift(treeNode);

  while (dirs.length) {
    const d = dirs.shift();

    // 以文件夹对象为分隔点，区分文件夹
    if (typeof d === 'object') {
      currentDir = d;
      continue;
    }

    // base path
    const bp = currentDir.basePath || path.dirname(d);
    // full path
    const fp = path.resolve(__dirname, d);

    const info = await stat(fp);
    if (info.isDirectory()) {
      // 是文件夹，创建并保存当前文件夹信息对象
      const dirInfo = newDirectoryInfo({ bp, fp, info });
      currentDir.children.push(dirInfo);

      // 将文件夹的子文件压如队列
      dirs.push(dirInfo);
      const childFiles = await readdir(fp);
      childFiles.forEach(cf => {
        dirs.push(path.resolve(fp, cf));
      });
      // 所有文件夹信息放入数组
      dirList.push(dirInfo);
    } else if (info.isFile()) {
      // 是文件，创建并保存当前文件信息对象
      const fileInfo = newFileInfo({ bp, fp, info });
      currentDir.files.push(fileInfo);
      // 所有文件信息放入数组
      fileList.push(fileInfo);
    }
  }

  calcFileCount(treeNode);

  // 移除 basePath
  fileList.forEach(info => (info.basePath = null));
  dirList.forEach(info => (info.basePath = null));
  return {
    treeNode,
    fileList,
  };
};

// 递归计算文件数
const calcFileCount = (dirInfo: DirectoryInfo) => {
  dirInfo.selfFilesCount = dirInfo.files.length;
  let total = dirInfo.selfFilesCount;
  for (const child of dirInfo.children) {
    total += calcFileCount(child);
  }
  dirInfo.totalFilesCount = total;
  return total;
};

export type TraverseDirectoriesReturnValue = Awaited<ReturnType<typeof traverseDirectories>>;
