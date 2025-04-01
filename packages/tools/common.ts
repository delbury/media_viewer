// client 和 server 通用的工具函数

import chalk from 'chalk';
import { FullFileType } from '../shared/index';
import { AUDIO_REG, IMAGE_REG, TEXT_REG, VIDEO_REG } from './constant';

// 控制台打印日志
export const logInfo = (str: string) => console.info(chalk.blue(str));

// 判断文件类型
export const detectFileType = (ext: string): FullFileType => {
  if (IMAGE_REG.test(ext)) return 'image';
  if (AUDIO_REG.test(ext)) return 'audio';
  if (VIDEO_REG.test(ext)) return 'video';
  if (TEXT_REG.test(ext)) return 'text';
  return 'other';
};
