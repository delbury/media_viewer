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
