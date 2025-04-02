import { ApiResponseBase } from '#pkgs/apis';
import { detectFileType } from '#pkgs/tools/common';
import { IGNORE_FILE_NAME_REG } from '#pkgs/tools/constant';
import { exec, ExecOptions } from 'node:child_process';
import path from 'node:path';
import { POSTER_FILE_NAME_PREFIX, POSTER_MAX_SIZE } from '../config';

export const returnBody = function <T>(data?: T) {
  return {
    code: 0,
    data,
  } satisfies ApiResponseBase<T>;
};

export const returnError = function <T>(msg: string, code?: number) {
  return {
    code: code ?? 1,
    msg,
  } satisfies ApiResponseBase<T>;
};

// 打印错误
export const loggerError = (error: Error) => {
  console.error(error);
};

// 执行命令
export const execCommand = async (command: string, options?: ExecOptions) => {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      // 错误处理
      if (error) reject(error);
      resolve({ stdout, stderr });
    });
  });
};

// 隐藏文件或文件夹
export const hideFile = async (filePath: string) => {
  // windows 下隐藏文件
  if (process.platform === 'win32') {
    await execCommand(`attrib +h ${filePath}`);
  }

  // linux 下隐藏文件，默认传入的文件名已经以 . 开头
  // 这里只做判断，不做重命名
  const fileName = path.basename(filePath);
  if (!IGNORE_FILE_NAME_REG.test(fileName)) {
    return new Error('file name not start with "."');
  }
};

// 缩略图文件名
export const getPosterFileName = (fileName: string) => `${POSTER_FILE_NAME_PREFIX}${fileName}`;

// 生成缩略图封面
export const generatePoster = async (rawFilePath: string, posterFilePath: string) => {
  const fileType = detectFileType(path.extname(rawFilePath));
  if (fileType !== 'image') throw new Error('not an image file');

  // 生成缩略图
  const command = [
    'ffmpeg -y -hide_banner -loglevel error',
    `-i "${rawFilePath}"`,
    `-vf "scale='min(${POSTER_MAX_SIZE},iw)':'min(${POSTER_MAX_SIZE},ih)':force_original_aspect_ratio=decrease"`,
    `-q:v 5 "${posterFilePath}"`,
  ].join(' ');
  try {
    await execCommand(command);
  } catch (error) {
    loggerError(error);
    throw error;
  }
};
