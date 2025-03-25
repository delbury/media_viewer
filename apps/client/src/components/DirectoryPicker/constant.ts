import { mapToOptions } from '@/utils';
import { FileInfo, FullFileType } from '@shared';
import { AUDIO_EXTS, IMAGE_EXTS, VIDEO_EXTS } from '@tools/constant';

export const PATH_SEPARATOR = '/';

// 排序类型
export type FileSortMode = 'desc' | 'asc';
export type FileFilterField = Extract<FullFileType, 'image' | 'audio' | 'video'>;
const FILE_FILTER_MAP: Record<FileFilterField, string> = {
  video: 'Common.Video',
  audio: 'Common.Audio',
  image: 'Common.Image',
  // text: 'Common.Text',
  // other: 'Common.Other',
};
export const FILE_FILTER_OPTIONS = mapToOptions(FILE_FILTER_MAP);
const stringToMap = (str: string) => ({ label: str.toUpperCase(), value: str });
export const FILE_TYPE_EXTS: Record<FileFilterField, { label: string; value: string }[]> = {
  image: IMAGE_EXTS.map(stringToMap),
  audio: AUDIO_EXTS.map(stringToMap),
  video: VIDEO_EXTS.map(stringToMap),
  // text: TEXT_EXTS,
};

// 文件夹信息行的高度
export const DIRECTORY_ITEM_HEIGHT = 48;

// 文件排序选项
export type FileSortField = 'name' | 'size' | 'type' | 'updated' | 'created' | 'duration';
export const FILE_SORT_API_FIELD_MAP: Record<FileSortField, keyof FileInfo> = {
  name: 'name',
  size: 'size',
  type: 'fileType',
  updated: 'updated',
  created: 'created',
  duration: 'duration',
};

const FILE_SORT_MAP: Record<FileSortField, string> = {
  type: 'Common.Type',
  size: 'Common.Size',
  duration: 'Common.Duration',
  name: 'Common.Name',
  updated: 'Common.Updated',
  created: 'Common.Created',
};
export const FILE_SORT_OPTIONS = mapToOptions(FILE_SORT_MAP);
