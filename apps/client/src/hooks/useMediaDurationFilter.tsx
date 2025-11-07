import { FileInfo } from '#pkgs/apis';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

interface UseMediaDurationFilterParams {
  files?: FileInfo[];
  durationRange: number[];
}

export const useMediaDurationFilter = ({ files, durationRange }: UseMediaDurationFilterParams) => {
  const filterRes = useMemo(() => {
    const leftEdge = durationRange[0];
    const rightEdge = durationRange[1];
    // 是否过滤
    const isFiltered = !!leftEdge || rightEdge !== Infinity;

    if (!isFiltered) {
      return {
        filteredFiles: files,
        isFiltered,
      };
    }

    const filteredFiles: FileInfo[] = [];
    if (files && isFiltered && leftEdge < rightEdge) {
      for (let i = 0; i < files.length; i++) {
        const duration = files[i].duration;
        // 没有时长信息或者满足过滤条件
        if (isNil(duration) || (leftEdge < duration && duration < rightEdge)) {
          filteredFiles.push(files[i]);
        }
      }
    }

    return {
      filteredFiles,
      isFiltered,
    };
  }, [files, durationRange]);

  return filterRes;
};
