import { ApiResponseBase } from '#pkgs/apis';
import { logError } from '#pkgs/tools/common';
import { IGNORE_FILE_NAME_REG } from '#pkgs/tools/constant';
import { isNil } from 'lodash-es';
import { exec, ExecOptions } from 'node:child_process';
import path from 'node:path';
import { DIRECTORY_ROOTS } from '../config';
import { ERROR_MSG } from '../i18n/errorMsg';

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

// 执行命令
export const execCommand = (command: string, options?: ExecOptions) => {
  return new Promise<{
    stdout: string | Buffer<ArrayBufferLike>;
    stderr: string | Buffer<ArrayBufferLike>;
  }>((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      // 错误处理
      if (error) {
        logError(error);
        reject(new Error(ERROR_MSG.commandError));
      }
      resolve({ stdout, stderr });
    });
  });
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
