import { EMPTY_SYMBOL } from '#/utils/constant';
import { DirectoryInfo, FileInfo } from '#pkgs/apis';
import { splitPath } from '#pkgs/tools/common';
import { useMemo } from 'react';

const PATH_DIVIDER_SYMBOL = ' ⋱ ';
const LEFT_SYMBOL = '⇝ ';
const RIGHT_SYMBOL = ' ⇜';

// 格式化当前文件路径
export const formatCurrentPath = (file?: FileInfo | DirectoryInfo) =>
  file ? splitPath(file.showPath).reverse().join(PATH_DIVIDER_SYMBOL) : EMPTY_SYMBOL;

// 格式化父文件夹
export const formatParentDir = (file?: FileInfo | DirectoryInfo) =>
  file
    ? splitPath(file.showPath, { ignoreLast: true }).reverse().join(PATH_DIVIDER_SYMBOL)
    : EMPTY_SYMBOL;

export const useFileTitle = ({ file }: { file?: FileInfo } = {}) => {
  const secondaryTitle = useMemo(() => {
    if (!file) return;

    const text = formatParentDir(file);

    return `${LEFT_SYMBOL}${text}${RIGHT_SYMBOL}`;

    // const list = file.showPath.split('/').filter(it => !!it);
    // // ./a/b/c/file
    // // 最多展示当前文件的前两级文件夹
    // if (list.length <= 1) return;

    // const textArr = [];
    // let i = list.length - 2;
    // while (i >= list.length - 3 && list[i]) {
    //   textArr.unshift(list[i]);
    //   i--;
    // }

    // return `.../${textArr.join('/')}/`;
  }, [file]);

  return {
    secondaryTitle,
    title: file?.name,
  };
};
