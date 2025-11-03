import { DIR_PATH_REVERSE_KEY } from '#/components/GlobalSetting';
import { EMPTY_SYMBOL } from '#/utils/constant';
import { DirectoryInfo, FileInfo } from '#pkgs/apis';
import { splitPath } from '#pkgs/tools/common';
import { useMemo } from 'react';
import { usePersistentConfigValue } from './usePersistentConfig';

const DEFAULT_PATH_DIVIDER_SYMBOL = ' / ';
const PATH_DIVIDER_SYMBOL = ' ⋱ ';
const LEFT_SYMBOL = '⇝ ';
const RIGHT_SYMBOL = ' ⇜';

const defaultFormatShowPath = (file?: FileInfo | DirectoryInfo) =>
  file ? splitPath(file.showPath).join(DEFAULT_PATH_DIVIDER_SYMBOL) : EMPTY_SYMBOL;

const defaultFormatParentShowPath = (file?: FileInfo | DirectoryInfo) =>
  file
    ? splitPath(file.showPath, { ignoreLast: true }).join(DEFAULT_PATH_DIVIDER_SYMBOL)
    : EMPTY_SYMBOL;

// 格式化当前文件路径
const formatCurrentPathReverse = (file?: FileInfo | DirectoryInfo) =>
  file ? splitPath(file.showPath).reverse().join(PATH_DIVIDER_SYMBOL) : EMPTY_SYMBOL;

// 格式化父文件夹
const formatParentDirReverse = (file?: FileInfo | DirectoryInfo) =>
  file
    ? splitPath(file.showPath, { ignoreLast: true }).reverse().join(PATH_DIVIDER_SYMBOL)
    : EMPTY_SYMBOL;

export const useFormatCurrentPath = (file?: FileInfo | DirectoryInfo) => {
  const reverse = usePersistentConfigValue<boolean>(DIR_PATH_REVERSE_KEY);
  return useMemo(
    () => (reverse ? defaultFormatShowPath(file) : formatCurrentPathReverse(file)),
    [file, reverse]
  );
};

export const useFormatParentDirHandler = () => {
  const reverse = usePersistentConfigValue<boolean>(DIR_PATH_REVERSE_KEY);
  return reverse ? formatParentDirReverse : defaultFormatParentShowPath;
};

export const useFileTitle = ({ file }: { file?: FileInfo } = {}) => {
  const reverse = usePersistentConfigValue<boolean>(DIR_PATH_REVERSE_KEY);

  const secondaryTitle = useMemo(() => {
    if (!file) return;

    if (reverse) {
      const text = formatParentDirReverse(file);
      return `${LEFT_SYMBOL}${text}${RIGHT_SYMBOL}`;
    }
    return defaultFormatParentShowPath(file);

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
  }, [file, reverse]);

  return {
    secondaryTitle,
    title: file?.name,
  };
};
