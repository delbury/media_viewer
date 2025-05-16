// 请求超时时间
export const REQUEST_TIMEOUT = 2 * 1000 * 60;

// 图片文件后缀
const CONST_IMAGE_EXTS = [
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
] as const;
export type ImageExts = (typeof CONST_IMAGE_EXTS)[number];
export const IMAGE_EXTS = [...CONST_IMAGE_EXTS];

// 音频文件后缀
const CONST_AUDIO_EXTS = ['mp3', 'wav', 'aac', 'flac', 'm4a', 'wma', 'ogg', 'mka'] as const;
export type AudioExts = (typeof CONST_AUDIO_EXTS)[number];
export const AUDIO_EXTS = [...CONST_AUDIO_EXTS];

// 视频文件后缀
const CONST_VIDEO_EXTS = [
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
] as const;
export type VideoExts = (typeof CONST_VIDEO_EXTS)[number];
export const VIDEO_EXTS = [...CONST_VIDEO_EXTS];

// 字幕文件后缀
const CONST_SUBTITLES_EXTS = ['ass', 'srt', 'vtt'] as const;
export type SubtitlesExts = (typeof CONST_SUBTITLES_EXTS)[number];
export const SUBTITLES_EXTS = [...CONST_SUBTITLES_EXTS];

// 歌词文件后缀
export const LYRIC_EXT = 'lrc';
export type LyricExt = typeof LYRIC_EXT;

// 文本文件后缀
const CONST_TEXT_EXTS = ['pdf', 'txt', LYRIC_EXT, ...SUBTITLES_EXTS] as const;
export type TextExts = (typeof CONST_TEXT_EXTS)[number];
export const TEXT_EXTS = [...CONST_TEXT_EXTS];

export const IMAGE_REG = new RegExp(`\\.(${IMAGE_EXTS.join('|')})$`, 'i');
export const AUDIO_REG = new RegExp(`\\.(${AUDIO_EXTS.join('|')})$`, 'i');
export const VIDEO_REG = new RegExp(`\\.(${VIDEO_EXTS.join('|')})$`, 'i');
export const TEXT_REG = new RegExp(`\\.(${TEXT_EXTS.join('|')})$`, 'i');

// 需要忽略的文件夹或文件名前缀
export const IGNORE_FILE_NAME_PREFIX = '.__ignore__';
export const IGNORE_FILE_NAME_REG = new RegExp(
  `(^${IGNORE_FILE_NAME_PREFIX}.*|^\\.DS_Store$)`,
  'i'
);
