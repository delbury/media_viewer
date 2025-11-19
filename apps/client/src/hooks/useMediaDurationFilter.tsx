import { FileInfo } from '#pkgs/apis';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

interface UseMediaDurationFilterParams {
  files?: FileInfo[];
  durationRange: number[];
  createdTimeRange: number[];
}

const OneDayMs = 24 * 60 * 60 * 1000;

export const useMediaDurationFilter = ({
  files,
  durationRange,
  createdTimeRange,
}: UseMediaDurationFilterParams) => {
  const filterRes = useMemo(() => {
    // 过滤时长
    const leftDurationEdge = durationRange[0];
    const rightDurationEdge = durationRange[1];
    const isFilterDuration = !!leftDurationEdge || rightDurationEdge !== Infinity;

    // 过滤创建时间
    const leftTime = createdTimeRange[0];
    const rightTime = createdTimeRange[1];
    const isFilterTime = leftTime !== Infinity || !!rightTime;

    const isFiltered = isFilterDuration || isFilterTime;

    // 无需筛选
    if (!isFiltered) {
      return {
        filteredFiles: files,
        isFiltered,
      };
    }

    const filteredFiles: FileInfo[] = [];
    if (files && isFiltered && leftDurationEdge < rightDurationEdge && leftTime >= rightTime) {
      // 确定创建时间边界
      const today = new Date();
      const leftTimeEdge = today.setHours(0, 0, 0, 0) - leftTime * OneDayMs;
      const rightTimeEdge = today.setHours(24, 0, 0, 0) - rightTime * OneDayMs;

      for (let i = 0; i < files.length; i++) {
        let isHit = true;

        const duration = files[i].duration;
        // 没有时长信息或者满足时长过滤条件
        isHit &&= isNil(duration) || (leftDurationEdge < duration && duration < rightDurationEdge);

        const createdTime = files[i].created;
        isHit &&= leftTimeEdge < createdTime && createdTime < rightTimeEdge;

        if (isHit) filteredFiles.push(files[i]);
      }
    }

    return {
      filteredFiles,
      isFiltered,
    };
  }, [durationRange, createdTimeRange, files]);

  return filterRes;
};
