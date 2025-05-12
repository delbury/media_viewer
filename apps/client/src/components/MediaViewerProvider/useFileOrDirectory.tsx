import { DirectoryInfo, FileInfo } from '#pkgs/apis';
import { MediaFileType } from '#pkgs/shared';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseFileOrDirectoryParams {
  file?: FileInfo;
  dir?: DirectoryInfo;
  mediaType?: MediaFileType;
  defaultRandom?: boolean;
}

const getAllFiles = (type: MediaFileType, dir: DirectoryInfo, list: FileInfo[] = []) => {
  dir.files.forEach(f => {
    if (f.fileType === type) list.push(f);
  });
  for (const child of dir.children) {
    getAllFiles(type, child, list);
  }
  return list;
};

const getRandomIndex = (length: number) => Math.floor(Math.random() * length);

export const useFileOrDirectory = ({
  file,
  dir,
  mediaType,
  defaultRandom = true,
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

  const [fileList, setFileList] = useState<FileInfo[]>([]);

  // 随机播放，未播放的文件 index 列表
  const randomToPlayIndexes = useRef(new Set<number>());
  // 随机播放，未播放的文件 index
  const randomPlayedIndexes = useRef(new Set<number>());

  // 文件列表
  useEffect(() => {
    let list: FileInfo[] = [];
    if (mediaType) {
      if (dir) {
        list = getAllFiles(mediaType, dir);
      } else if (file) {
        list = [file];
      }
    }
    randomToPlayIndexes.current.clear();
    randomPlayedIndexes.current.clear();
    if (defaultRandom) {
      const startIndex = getRandomIndex(list.length);
      setCurrentFileIndex(startIndex);
      const newSet = new Set(Array.from({ length: list.length }, (_, k) => k));
      newSet.delete(startIndex);
      randomToPlayIndexes.current = newSet;
    } else {
      setCurrentFileIndex(0);
    }
    setFileList(list);
  }, [dir, file, mediaType]);

  // 上一个
  const handlePrev = useCallback(() => {
    if (isRandomPlay) return;

    const newIndex = currentFileIndex > 0 ? currentFileIndex - 1 : currentFileIndex;
    setCurrentFileIndex(newIndex);
  }, [currentFileIndex, isRandomPlay]);

  // 下一个
  const handleNext = useCallback(() => {
    // 将当前正在播放的文件加入到随机播放已播放列表
    randomPlayedIndexes.current.add(currentFileIndex);

    if (isRandomPlay) {
      // 随机播放
      const nextIndexIndex = getRandomIndex(randomToPlayIndexes.current.size);
      const nextIndex = [...randomToPlayIndexes.current][nextIndexIndex];
      randomToPlayIndexes.current.delete(nextIndex);
      setCurrentFileIndex(nextIndex);

      // 播放到头了，重新开始
      if (!randomToPlayIndexes.current.size) {
        randomPlayedIndexes.current.clear();
        randomToPlayIndexes.current = new Set(Array.from({ length: fileList.length }, (_, k) => k));
        randomToPlayIndexes.current.delete(nextIndex);
      }
    } else {
      const newIndex =
        currentFileIndex < fileList.length - 1 ? currentFileIndex + 1 : currentFileIndex;
      setCurrentFileIndex(newIndex);
    }
  }, [currentFileIndex, fileList.length, isRandomPlay]);

  const handleToggleRandom = useCallback(() => {
    setIsRandomPlay(v => !v);
  }, []);

  return {
    fileList,
    currentFileIndex,
    currentFile: fileList[currentFileIndex] as FileInfo | undefined,
    isList: fileList.length > 1,
    firstDisabled: isRandomPlay || (!isRandomPlay && currentFileIndex === 0),
    lastDisabled: !isRandomPlay && currentFileIndex === fileList.length - 1,
    isRandomPlay,
    goPrevFile: handlePrev,
    goNextFile: handleNext,
    toggleRandom: handleToggleRandom,
  };
};
