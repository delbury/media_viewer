import { ERROR_MSG } from '#pkgs/i18n/errorMsg';
import { execCommand } from '#pkgs/tools/cli';
import { findFileInfoInDir, splitPath } from '#pkgs/tools/common';
import { IGNORE_FILE_NAME_REG } from '#pkgs/tools/constant';
import path from 'node:path';
import { DIRECTORY_ROOTS } from '../config';
import { getTask } from './task';
import { FileInfo } from './traverseDirectories';

// 隐藏文件或文件夹
export const hideFile = async (filePath: string) => {
  // windows 下隐藏文件
  if (process.platform === 'win32') {
    await execCommand(`attrib +h "${filePath}"`);
  }

  // linux 下隐藏文件，默认传入的文件名已经以 . 开头
  // 这里只做判断，不做重命名
  const fileName = path.basename(filePath);
  if (!IGNORE_FILE_NAME_REG.test(fileName)) {
    return new Error('file name not start with "."');
  }
};

// 获取根目录
export const getRootDir = (index: number | string) => {
  const basePath = DIRECTORY_ROOTS?.[+index];
  if (!basePath) throw new Error(ERROR_MSG.noRootDir);

  return basePath;
};

// 获取文件路径
export const getFilePath = (fileInfo: Pick<FileInfo, 'basePathIndex' | 'relativePath'>) => {
  const basePath = getRootDir(fileInfo.basePathIndex as number);
  const filePath = path.posix.join(basePath, fileInfo.relativePath);
  return filePath;
};

// 根据入参获取 file info
export const getFileInfo = async (info: Pick<FileInfo, 'basePathIndex' | 'relativePath'>) => {
  const updateTask = getTask('dirUpdate');
  const cachedData = await updateTask.getCache();
  const rootDirs = cachedData?.treeNode?.children;
  if (!rootDirs) return null;

  const pathSeq = splitPath(info.relativePath);
  const findRes = findFileInfoInDir(rootDirs[info.basePathIndex as number], pathSeq);
  return findRes;
};
