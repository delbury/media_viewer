import { mapToOptions } from '@/utils';

export const PATH_SEPARATOR = '/';

const IMG_EXTS = ['jpg', 'png', 'jepg', 'webp', 'bmp', 'gif', 'svg', 'raw', 'tiff', 'tif', 'ico'];
const AUDIO_EXTS = ['mp3', 'wav', 'aac', 'flac', 'm4a', 'wma', 'ogg'];
const VIDEO_EXTS = ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'mpg', 'mpeg', 'webm', '3gp', 'ts'];
const TEXT_EXTS = ['pdf', 'txt'];

export const IMG_REG = new RegExp(`\\.(${IMG_EXTS.join('|')})$`, 'i');
export const AUDIO_REG = new RegExp(`\\.(${AUDIO_EXTS.join('|')})$`, 'i');
export const VIDEO_REG = new RegExp(`\\.(${VIDEO_EXTS.join('|')})$`, 'i');
export const TEXT_REG = new RegExp(`\\.(${TEXT_EXTS.join('|')})$`, 'i');

export type FileFilterField = 'image' | 'audio' | 'video';
const FILE_FILTER_MAP: Record<FileFilterField, string> = {
  image: 'Common.Image',
  audio: 'Common.Audio',
  video: 'Common.Video',
  // text: 'Common.Text',
  // other: 'Common.Other',
};
export const FILE_FILTER_OPTIONS = mapToOptions(FILE_FILTER_MAP);
const stringToMap = (str: string) => ({ label: str.toUpperCase(), value: str });
export const FILE_TYPE_EXTS: Record<FileFilterField, { label: string; value: string }[]> = {
  image: IMG_EXTS.map(stringToMap),
  audio: AUDIO_EXTS.map(stringToMap),
  video: VIDEO_EXTS.map(stringToMap),
  // text: TEXT_EXTS,
};

// 文件夹信息行的高度
export const DIRECTORY_ITEM_HEIGHT = 54;

// 文件排序选项
export type FileSortField = 'name' | 'size' | 'type' | 'updated' | 'created' | 'duration';
const FILE_SORT_MAP: Record<FileSortField, string> = {
  type: 'Common.Type',
  size: 'Common.Size',
  duration: 'Common.Duration',
  name: 'Common.Name',
  updated: 'Common.Updated',
  created: 'Common.Created',
};
export const FILE_SORT_OPTIONS = mapToOptions(FILE_SORT_MAP);
