import { ApiResponseBase, FileInfo } from '#pkgs/apis';
import { ERROR_MSG } from '#pkgs/i18n/errorMsg';
import { execCommand } from '#pkgs/tools/cli';
import { IGNORE_FILE_NAME_REG } from '#pkgs/tools/constant';
import { isNil } from 'lodash-es';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { DIRECTORY_ROOTS } from '../config';

export const returnBody = <T>(data?: T) => {
  return {
    code: 0,
    data,
  } satisfies ApiResponseBase<T>;
};

export const returnError = <T>(msg: string, code?: number) => {
  return {
    code: code ?? 1,
    msg,
  } satisfies ApiResponseBase<T>;
};

// 合法的数字字符串
export const validateNumberString = (ns?: string) => {
  if (isNil(ns)) throw new Error(ERROR_MSG.required);
  const num = +ns;
  if (Number.isNaN(num)) throw new Error(ERROR_MSG.notANumber);
  return num;
};

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

// 生成 hash
export const generateHash = (text: string) =>
  createHash('md5').update(text).digest('hex').substring(0, 8);

// 获取文件路径
export const getFilePath = (fileInfo: Pick<FileInfo, 'basePathIndex' | 'relativePath'>) => {
  const basePath = getRootDir(fileInfo.basePathIndex as number);
  const filePath = path.posix.join(basePath, fileInfo.relativePath);
  return filePath;
};
