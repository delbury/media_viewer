export const IMAGE_EXTS = [
  'gif',
  'jpg',
  'png',
  'jepg',
  'webp',
  'bmp',
  'svg',
  'raw',
  'tiff',
  'tif',
  'ico',
];
export const AUDIO_EXTS = ['mp3', 'wav', 'aac', 'flac', 'm4a', 'wma', 'ogg'];
export const VIDEO_EXTS = [
  'mp4',
  'mkv',
  'mov',
  'avi',
  'wmv',
  'flv',
  'mpg',
  'mpeg',
  'webm',
  '3gp',
  'ts',
];
export const TEXT_EXTS = ['pdf', 'txt'];

export const IMAGE_REG = new RegExp(`\\.(${IMAGE_EXTS.join('|')})$`, 'i');
export const AUDIO_REG = new RegExp(`\\.(${AUDIO_EXTS.join('|')})$`, 'i');
export const VIDEO_REG = new RegExp(`\\.(${VIDEO_EXTS.join('|')})$`, 'i');
export const TEXT_REG = new RegExp(`\\.(${TEXT_EXTS.join('|')})$`, 'i');

// 需要忽略的文件夹或文件名前缀
export const IGNORE_FILE_NAME_PREFIX = '.__ignore__';
export const IGNORE_FILE_NAME_REG = new RegExp(`^${IGNORE_FILE_NAME_PREFIX}.*`, 'i');
