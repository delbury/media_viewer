import { API_BASE_URL } from '#/request';
import { FileInfo, joinUrlWithQueryString } from '#pkgs/apis';

// 格式化日期
export const formatDate = (v: number) => {
  const date = new Date(v);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}-${month}-${day}`;
};

// 格式化文件大小
export const formatFileSize = (size: number) => {
  const unit = ['B', 'K', 'M', 'G'];
  for (let i = 0; i < unit.length; i++) {
    if (size < 1024) {
      return `${size.toFixed(2)}${unit[i]}`;
    }
    size /= 1024;
  }
};

// 将对象转换为选项数组
export const mapToOptions = <T extends string>(map: Record<T, string>) => {
  return Object.entries(map).map(([key, value]) => ({ label: value as string, value: key as T }));
};

// 阻止冒泡
export const stopPropagation = (ev: Pick<Event, 'stopPropagation'>) => ev.stopPropagation();

// 阻止浏览器默认行为
export const preventDefault = (ev: Pick<Event, 'preventDefault'>) => ev.preventDefault();

// 生成文件缩略图 url
export const getFilePosterUrl = (file?: FileInfo) => {
  if (!file) return '';
  const poster = joinUrlWithQueryString(
    'filePoster',
    {
      basePathIndex: file.basePathIndex.toString(),
      relativePath: file.relativePath,
    },
    API_BASE_URL
  );
  return poster;
};

// 生成文件资源 url
export const getFileSourceUrl = (file?: FileInfo) => {
  if (!file) return '';
  const source = joinUrlWithQueryString(
    'fileGet',
    {
      basePathIndex: file.basePathIndex.toString(),
      relativePath: file.relativePath,
    },
    API_BASE_URL
  );

  return source;
};
