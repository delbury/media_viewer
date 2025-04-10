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
