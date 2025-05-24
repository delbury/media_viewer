import { FileInfo } from '#pkgs/apis';
import { INFO_ID_FIELD } from '#pkgs/tools/common';
import { isNil } from 'lodash-es';
import { useCallback, useEffect, useState } from 'react';
import { useIdleCallback } from './useIdleCallback';

// dislike 的 media 文件信息保存在 local 的 key
export const DISLIKE_MEDIA_FILE_STORAGE_KEY = '_dislike_media_file_like';

const MEMORY_CACHE: { list: FileInfo[] | null } = {
  list: null,
};

interface UseDislikeFileParams {
  file?: FileInfo;
}

export const useDislikeFile = ({ file }: UseDislikeFileParams) => {
  // 初始化
  useEffect(() => {
    if (!isNil(MEMORY_CACHE.list)) return;

    try {
      const text = localStorage.getItem(DISLIKE_MEDIA_FILE_STORAGE_KEY);
      const list = JSON.parse(text ?? '');
      if (Array.isArray(list)) MEMORY_CACHE.list = list;
      else MEMORY_CACHE.list = [];
    } catch {
      MEMORY_CACHE.list = [];
      localStorage.removeItem(DISLIKE_MEDIA_FILE_STORAGE_KEY);
    }
  }, []);

  const [dislike, setDislike] = useState(false);

  const saveList = useCallback(() => {
    localStorage.setItem(DISLIKE_MEDIA_FILE_STORAGE_KEY, JSON.stringify(MEMORY_CACHE.list));
  }, []);
  const saveListIdle = useIdleCallback(saveList);

  const handleToggleDislike = useCallback(async () => {
    if (!file) return;

    setDislike(v => {
      const newVal = !v;

      if (v) {
        // 移除
        const index = MEMORY_CACHE.list?.findIndex(it => it[INFO_ID_FIELD] === file[INFO_ID_FIELD]);
        if (!isNil(index) && index > -1) MEMORY_CACHE.list?.splice(index, 1);
      } else {
        // 添加
        MEMORY_CACHE.list?.push(file);
      }
      // 保存到本地
      saveListIdle();
      return newVal;
    });
  }, [file, saveListIdle]);

  // 设置初始值
  useEffect(() => {
    if (!file || !MEMORY_CACHE.list) return setDislike(false);
    setDislike(MEMORY_CACHE.list.some(it => it[INFO_ID_FIELD] === file[INFO_ID_FIELD]));
  }, [file]);

  return {
    dislike,
    toggleDislike: handleToggleDislike,
  };
};
