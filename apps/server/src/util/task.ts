import { DirUpdateData } from '#pkgs/shared';

// 文件夹树更新任务
const updateTask: {
  loading: boolean;
  cache?: DirUpdateData;
} = {
  loading: false,
  cache: null,
};

// 清除文件缩略图任务
const clearPosterTask: {
  loading: boolean;
} = {
  loading: false,
};

export const GLOBAL_TASK = {
  update: updateTask,
  clearPoster: clearPosterTask,
} satisfies Record<
  string,
  {
    loading: boolean;
    cache?: unknown;
  }
>;
