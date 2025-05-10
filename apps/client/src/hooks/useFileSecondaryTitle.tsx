import { FileInfo } from '#pkgs/apis';
import { useMemo } from 'react';

export const useFileSecondaryTitle = (file?: FileInfo) => {
  const secondaryTitle = useMemo(() => {
    if (!file) return;

    const list = file.showPath.split('/').filter(it => !!it);
    // ./a/b/c/file
    // 最多展示当前文件的前两级文件夹
    if (list.length <= 1) return;

    const textArr = [];
    let i = list.length - 2;
    while (i >= list.length - 3 && list[i]) {
      textArr.unshift(list[i]);
      i--;
    }

    return `.../${textArr.join('/')}/`;
  }, [file]);

  return {
    secondaryTitle,
    title: file?.name,
  };
};
