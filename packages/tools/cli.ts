import { exec, ExecOptions } from 'node:child_process';
import { ObjectEncodingOptions } from 'node:fs';
import { ERROR_MSG } from '../i18n/errorMsg';
import { logError } from './common';

interface CustomOptions {
  quitWhenError?: boolean;
}

// 执行命令
export const execCommand = (
  command: string,
  options?: ObjectEncodingOptions & ExecOptions & CustomOptions
) => {
  return new Promise<{
    stdout: string | Buffer<ArrayBufferLike>;
    stderr: string | Buffer<ArrayBufferLike>;
  }>((resolve, reject) => {
    exec(
      command,
      {
        windowsHide: true,
        ...options,
      },
      (error, stdout, stderr) => {
        // 错误处理
        if (error) {
          if (!options?.quitWhenError) logError(error);
          reject(new Error(ERROR_MSG.commandError));
        }
        resolve({ stdout, stderr });
      }
    );
  });
};
