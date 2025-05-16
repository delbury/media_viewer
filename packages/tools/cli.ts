import { exec, ExecOptions } from 'node:child_process';
import { ObjectEncodingOptions } from 'node:fs';
import { ERROR_MSG } from '../i18n/errorMsg';
import { logError } from './common';

// 执行命令
export const execCommand = (command: string, options?: ObjectEncodingOptions & ExecOptions) => {
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
