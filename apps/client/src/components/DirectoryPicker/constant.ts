export const PATH_SEPARATOR = '/';

export const IMG_REG = /\.(jpg|png|jepg|webp|bmp|gif|svg|raw|tiff|tif|ico)/i;
export const AUDIO_REG = /\.(mp3|wav|aac|flac|m4a|wma|ogg)/i;
export const VIDEO_REG = /\.(mp4|mkv|avi|mov|wmv|flv|mpg|mpeg|webm|3gp|ts)/i;
export const TEXT_REG = /\.(pdf|txt)/i;

// 文件夹信息行的高度
export const DIRECTORY_ITEM_HEIGHT = 54;

// 文件排序选项
export type FileSortField = 'default' | 'name' | 'size' | 'type' | 'updated' | 'created' | 'duration';
export const FILE_SORT_OPTIONS: { label: string; value: FileSortField }[] = [
  {
    label: 'Common.Type',
    value: 'type',
  },
  {
    label: 'Common.Size',
    value: 'size',
  },
  {
    label: 'Common.Duration',
    value: 'duration',
  },
  {
    label: 'Common.Default',
    value: 'default',
  },
  {
    label: 'Common.Name',
    value: 'name',
  },
  {
    label: 'Common.Updated',
    value: 'updated',
  },
  {
    label: 'Common.Created',
    value: 'created',
  },
];
