import { API_BASE_URL } from '#/request';
import { FileInfo, joinUrlWithQueryString } from '#pkgs/apis';
import hashSum from 'hash-sum';
import { isNil } from 'lodash-es';

// 格式化日期
export const formatDate = (v: number) => {
  const date = new Date(v);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 格式化时间
export const formatTime = (
  t?: number | string | null,
  {
    withHour,
    fixed,
    withSymbol,
    placeholder,
  }: {
    // 强制显示小时
    withHour?: boolean;
    // 显示小数点后 n 位
    fixed?: number;
    // 强制显示正负号
    withSymbol?: boolean;
    placeholder?: string;
  } = {}
) => {
  if (isNil(t)) return placeholder ?? '--:--';
  // 转换为数字
  t = +t;
  // 判断正负
  const symbol = t < 0 ? '-' : withSymbol ? '+' : '';
  // 取绝对值
  t = Math.abs(t);
  // 取小数部分
  let decimal = (t - Math.trunc(t)).toString().substring(2, 2 + (fixed ?? 0));
  decimal = decimal.padStart(fixed ?? 0, '0');
  if (decimal) decimal = `.${decimal}`;
  // 去掉小数部分
  t = Math.trunc(t);

  if (Number.isNaN(t)) return withHour ? '00:00:00' : '00:00';

  // 减去秒之后的剩余部分
  const s = t % 60;
  t -= s;
  t /= 60;
  // 计算分
  const m = t % 60;
  t -= m;
  t /= 60;
  // 计算时
  const h = t ? `${t.toString().padStart(2, '0')}:` : withHour ? '00:' : '';

  return `${symbol} ${h}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}${decimal}`;
};

// 格式化数字
export const formatNumber = (num: number, fixed?: number) => {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: fixed,
    maximumFractionDigits: fixed,
  });
};

// 格式化文件大小
export const formatFileSize = (
  size: number,
  { toK, fixed }: { toK?: boolean; fixed?: number } = {}
) => {
  const unit = toK ? ['B', 'K'] : ['B', 'K', 'M', 'G'];
  for (let i = 0; i < unit.length; i++) {
    if (size < 1024) {
      return `${formatNumber(size, fixed ?? 2)}${unit[i]}`;
    }
    if (i < unit.length - 1) size /= 1024;
  }
  return `${formatNumber(size, fixed ?? 2)}${unit.at(-1)}`;
};

// 将角度限定在 0 ~ 270 之间
export const normalizeDegree = (deg: number) => {
  let pureDeg = deg % 360;
  pureDeg += pureDeg < 0 ? 360 : 0;
  return pureDeg;
};

// 将对象转换为选项数组
export const mapToOptions = <T extends string>(map: Record<T, string>) => {
  return Object.entries(map).map(([key, value]) => ({ label: value as string, value: key as T }));
};

// 将字符串转换为对象
export const stringToMap = <T extends string>(str: T) => ({ label: str.toUpperCase(), value: str });

// 阻止冒泡
export const stopPropagation = (ev: Pick<Event, 'stopPropagation'>) => ev.stopPropagation();

// 阻止浏览器默认行为
export const preventDefault = (ev: Pick<Event, 'preventDefault'>) => ev.preventDefault();

// 生成文件缩略图 url
export const getFilePosterUrl = (file?: FileInfo) => {
  if (!file) return '';
  const poster = joinUrlWithQueryString(
    'posterGet',
    {
      basePathIndex: file.basePathIndex?.toString() as string,
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
      basePathIndex: file.basePathIndex?.toString() as string,
      relativePath: file.relativePath,
    },
    API_BASE_URL
  );

  return source;
};

// 生成视频资源 fallback url
export const getVideoFileFallbackUrl = (file?: FileInfo) => {
  if (!file) return '';
  const fallback = joinUrlWithQueryString(
    'videoFallback',
    {
      basePathIndex: file.basePathIndex?.toString() as string,
      relativePath: file.relativePath,
    },
    API_BASE_URL
  );

  return fallback;
};

// 生成 hash
export const createHash = (text?: string) => {
  const hash = hashSum(text ?? '');
  return hash;
};

// 生成 url
export const generateUrlWithSearch = (params: URLSearchParams) =>
  `${window.location.origin}${window.location.pathname}?${params.toString()}`;
