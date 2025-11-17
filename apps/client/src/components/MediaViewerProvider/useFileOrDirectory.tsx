import { getRandomIndex } from '#/utils/randomStrategy';
import { DirectoryInfo, FileInfo } from '#pkgs/apis';
import { MediaFileType } from '#pkgs/shared';
import { getAllFiles } from '#pkgs/tools/common';
import { isNil } from 'lodash-es';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RandomPlayStrategy } from '../GlobalSetting';

interface UseFileOrDirectoryParams {
  file?: FileInfo;
  dir?: DirectoryInfo;
  list?: FileInfo[];
  mediaType?: MediaFileType;
  defaultRandom?: boolean;
  randomStrategy?: RandomPlayStrategy;
  lazyInit?: boolean;
}

export const useFileOrDirectory = ({
  file,
  dir,
  list,
  mediaType,
  defaultRandom = true,
  randomStrategy = RandomPlayStrategy.Default,
  lazyInit,
}: UseFileOrDirectoryParams) => {
  /**
   * 播放模式：
   *
   * - 顺序播放，直接使用 currentFileIndex 记录播放历史
   *
   * - 随机播放，需要一个队列来记录播放历史
   */
  // 是否是随机播放
  const [isRandomPlay, setIsRandomPlay] = useState(defaultRandom);
  // 顺当前播放的文件 index
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  const [rawFileList, setRawFileList] = useState<FileInfo[]>([]);
  const [fileList, setFileList] = useState<FileInfo[]>([]);

  // 随机播放，未播放的文件 index 列表
  const randomToPlayIndexes = useRef(new Set<number>());
  // 随机播放，已播放的文件 index
  const randomPlayedIndexes = useRef(new Set<number>());

  const initPlayVideo = useCallback(
    (files: FileInfo[]) => {
      randomToPlayIndexes.current.clear();
      randomPlayedIndexes.current.clear();
      if (defaultRandom) {
        const startIndex = getRandomIndex(files.length, randomStrategy);
        setCurrentFileIndex(startIndex);
        const newSet = new Set(Array.from({ length: files.length }, (_, k) => k));
        newSet.delete(startIndex);
        randomToPlayIndexes.current = newSet;
      } else {
        setCurrentFileIndex(0);
      }
    },
    [defaultRandom, randomStrategy]
  );

  // 文件列表
  useEffect(() => {
    let fileList: FileInfo[] = [];
    if (mediaType) {
      if (list?.length) {
        fileList = list;
      } else if (dir) {
        fileList = getAllFiles(mediaType, dir);
      } else if (file) {
        fileList = [file];
      }
    }

    if (!lazyInit) {
      initPlayVideo(fileList);
      setFileList(fileList);
    }

    setRawFileList(fileList);
  }, [dir, file, list, mediaType]);

  // 上一个
  const handlePrev = useCallback(() => {
    if (isRandomPlay) return;

    const newIndex = currentFileIndex > 0 ? currentFileIndex - 1 : currentFileIndex;
    setCurrentFileIndex(newIndex);
  }, [currentFileIndex, isRandomPlay]);

  // 下一个
  const handleNext = useCallback(
    (index?: number) => {
      // 将当前正在播放的文件加入到随机播放已播放列表
      randomPlayedIndexes.current.add(currentFileIndex);

      if (isRandomPlay) {
        // 随机播放
        const nextIndex = isNil(index)
          ? [...randomToPlayIndexes.current][
              getRandomIndex(randomToPlayIndexes.current.size, randomStrategy)
            ]
          : index;
        randomToPlayIndexes.current.delete(nextIndex);
        setCurrentFileIndex(nextIndex);

        // 播放到头了，重新开始
        if (!randomToPlayIndexes.current.size) {
          randomPlayedIndexes.current.clear();
          randomToPlayIndexes.current = new Set(
            Array.from({ length: fileList.length }, (_, k) => k)
          );
          randomToPlayIndexes.current.delete(nextIndex);
        }
      } else {
        const newIndex = isNil(index)
          ? currentFileIndex < fileList.length - 1
            ? currentFileIndex + 1
            : currentFileIndex
          : index;
        setCurrentFileIndex(newIndex);
      }
    },
    [currentFileIndex, fileList.length, isRandomPlay]
  );

  const handleToggleRandom = useCallback(() => {
    setIsRandomPlay(v => !v);
  }, []);

  // 过滤播放列表
  const filterFileList = useCallback(
    (files: FileInfo[]) => {
      initPlayVideo(files);
      setFileList(files);
    },
    [initPlayVideo]
  );

  const clearFileList = useCallback(() => {
    initPlayVideo([]);
    setFileList([]);
  }, [initPlayVideo]);

  return {
    fileList,
    setFileList,
    rawFileList,
    currentFileIndex,
    setCurrentFileIndex,
    currentFile: fileList[currentFileIndex] as FileInfo | undefined,
    isList: rawFileList.length > 1,
    prevDisabled: isRandomPlay || (!isRandomPlay && currentFileIndex === 0),
    nextDisabled: !isRandomPlay && currentFileIndex === fileList.length - 1,
    isRandomPlay,
    goPrevFile: handlePrev,
    goNextFile: handleNext,
    toggleRandom: handleToggleRandom,
    filterFileList,
    clearFileList,
  };
};
