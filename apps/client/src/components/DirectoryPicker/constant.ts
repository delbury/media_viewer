import { mapToOptions, stringToMap } from '#/utils';
import { DirectoryInfo, FileInfo } from '#pkgs/apis';
import { FullFileType } from '#pkgs/shared';
import { AUDIO_EXTS, IMAGE_EXTS, VIDEO_EXTS } from '#pkgs/tools/constant';

export const PATH_SEPARATOR = '/';

// 排序类型
export type FileFilterField = Extract<FullFileType, 'image' | 'audio' | 'video'>;
const FILE_FILTER_MAP: Record<FileFilterField, string> = {
  video: 'Common.Video',
  audio: 'Common.Audio',
  image: 'Common.Image',
  // text: 'Common.Text',
  // other: 'Common.Other',
};
export const FULL_FILE_FILTER_MAP: Record<FullFileType, string> = {
  ...FILE_FILTER_MAP,
  text: 'Common.Text',
  other: 'Common.Other',
};
export const FILE_FILTER_OPTIONS = mapToOptions(FILE_FILTER_MAP);
export const FILE_TYPE_EXTS = {
  image: IMAGE_EXTS.map(stringToMap),
  audio: AUDIO_EXTS.map(stringToMap),
  video: VIDEO_EXTS.map(stringToMap),
  // text: TEXT_EXTS,
} satisfies Record<FileFilterField, { label: string; value: string }[]>;

// 文件夹信息行的高度
export const DIRECTORY_ITEM_HEIGHT = 40;

// 文件排序选项
export type FileSortField = Extract<
  FileInfo,
  'name' | 'size' | 'type' | 'updated' | 'created' | 'duration'
>;
export const FILE_SORT_API_FIELD_MAP: Record<FileSortField, keyof FileInfo> = {
  name: 'name',
  size: 'size',
  type: 'fileType',
  updated: 'updated',
  created: 'created',
  duration: 'duration',
};
const FILE_SORT_MAP: Record<FileSortField, string> = {
  type: 'File.Type',
  size: 'File.Size',
  duration: 'File.Duration',
  name: 'File.Name',
  updated: 'File.Updated',
  created: 'File.Created',
};
export const FILE_SORT_OPTIONS = mapToOptions(FILE_SORT_MAP);

// 文件夹排序选项
export type DirectorySortField = 'name' | 'updated' | 'created' | 'totalCount' | 'selfCount';
export const DIRECTORY_SORT_API_FIELD_MAP: Record<DirectorySortField, keyof DirectoryInfo> = {
  name: 'name',
  updated: 'updated',
  created: 'created',
  totalCount: 'totalFilesCount',
  selfCount: 'selfFilesCount',
};
const DIRECTORY_SORT_MAP: Record<DirectorySortField, string> = {
  name: 'File.Name',
  totalCount: 'File.TotalCount',
  selfCount: 'File.SelfCount',
  updated: 'File.Updated',
  created: 'File.Created',
};
export const DIRECTORY_SORT_OPTIONS = mapToOptions(DIRECTORY_SORT_MAP);
