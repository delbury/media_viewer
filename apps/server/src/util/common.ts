import { ApiResponseBase } from '#pkgs/apis';
import { logError } from '#pkgs/tools/common';
import { IGNORE_FILE_NAME_REG } from '#pkgs/tools/constant';
import { exec, ExecOptions } from 'node:child_process';
import path from 'node:path';
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

// 执行命令
export const execCommand = (command: string, options?: ExecOptions) => {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
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
