import { FullFileType } from '../shared';
import { AUDIO_REG, IMAGE_REG, TEXT_REG, VIDEO_REG } from './constant';

export const logInfo = (...args: Parameters<Console['info']>) => console.info(...args);

// 判断文件类型
export const detectFileType = (ext: string): FullFileType => {
  if (IMAGE_REG.test(ext)) return 'image';
  if (AUDIO_REG.test(ext)) return 'audio';
  if (VIDEO_REG.test(ext)) return 'video';
  if (TEXT_REG.test(ext)) return 'text';
  return 'other';
};
