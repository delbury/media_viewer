import { DIR_PATH_REVERSE_KEY } from '#/components/GlobalSetting';
import { EMPTY_SYMBOL } from '#/utils/constant';
import { DirectoryInfo, FileInfo } from '#pkgs/apis';
import { splitPath } from '#pkgs/tools/common';
import React, { useMemo } from 'react';
import { StyledPathDirLabel } from './style';
import { usePersistentConfigValue } from './usePersistentConfig';

const DEFAULT_PATH_DIVIDER_SYMBOL = ' / ';
const PATH_DIVIDER_SYMBOL = ' ⋱ ';
const LEFT_SYMBOL = '⇝ ';
const RIGHT_SYMBOL = ' ⇜';

const defaultFormatParentShowPath = (file?: FileInfo | DirectoryInfo) =>
  file
    ? splitPath(file.showPath, { ignoreLast: true }).join(DEFAULT_PATH_DIVIDER_SYMBOL)
    : EMPTY_SYMBOL;

// 格式化父文件夹
const formatParentDirReverse = (file?: FileInfo | DirectoryInfo) =>
  file
    ? splitPath(file.showPath, { ignoreLast: true }).reverse().join(PATH_DIVIDER_SYMBOL)
    : EMPTY_SYMBOL;

const renderPaths = (
  file?: FileInfo | DirectoryInfo,
  reverse?: boolean,
  highlightDirs?: string[],
  ignoreLast?: boolean
) => {
  if (!file) return;

  const paths = splitPath(file.showPath, { ignoreLast });
  let leftSymbol = '';
  let rightSymbol = '';
  let dividerSymbol = DEFAULT_PATH_DIVIDER_SYMBOL;

  if (reverse) {
    // const text = formatParentDirReverse(file);
    paths.reverse();
    leftSymbol = RIGHT_SYMBOL;
    rightSymbol = LEFT_SYMBOL;
    dividerSymbol = PATH_DIVIDER_SYMBOL;
  }

  return (
    <span>
      {leftSymbol}
      {paths.map((str, index) => (
        <React.Fragment key={`${str}-${index}`}>
          <StyledPathDirLabel highlight={highlightDirs?.includes(str)}>{str}</StyledPathDirLabel>
          {paths.length - 1 !== index && <span> {dividerSymbol} </span>}
        </React.Fragment>
      ))}
      {rightSymbol}
    </span>
  );
};

export const useFormatParentDirHandler = () => {
  const reverse = usePersistentConfigValue<boolean>(DIR_PATH_REVERSE_KEY);
  return reverse ? formatParentDirReverse : defaultFormatParentShowPath;
};

export const useFormatCurrentPath = (file?: FileInfo | DirectoryInfo, highlightDirs?: string[]) => {
  const reverse = usePersistentConfigValue<boolean>(DIR_PATH_REVERSE_KEY);
  return useMemo(
    () => renderPaths(file, reverse, highlightDirs, false) || EMPTY_SYMBOL,
    [file, reverse, highlightDirs]
  );
};

export const useFileTitle = ({
  file,
  highlightDirs,
}: { file?: FileInfo; highlightDirs?: string[] } = {}) => {
  const reverse = usePersistentConfigValue<boolean>(DIR_PATH_REVERSE_KEY);

  const secondaryTitle = useMemo(() => {
    return renderPaths(file, reverse, highlightDirs, true);

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
  }, [file, highlightDirs, reverse]);

  return {
    secondaryTitle,
    title: file?.name,
  };
};
