// server 特有的工具函数

import { exec, ExecOptions } from 'node:child_process';
import path from 'node:path';
import { detectFileType } from './common';
import { IGNORE_FILE_NAME_REG, POSTER_FILE_NAME_PREFIX } from './constant';

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
export const generatePoster = async (filePath: string) => {
  const fileType = detectFileType(path.extname(filePath));
  if (fileType !== 'image') throw new Error('not an image file');

  const fileDir = path.dirname(filePath);
  const fileName = path.basename(filePath);
  const posterFileName = getPosterFileName(fileName);
  const posterFilePath = path.join(fileDir, posterFileName);

  // 判断文件是否存在
};
