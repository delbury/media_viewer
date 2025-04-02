import { ApiResponseDataTypes } from '#pkgs/apis';

interface BaseTask<T = unknown> {
  loading: boolean;
  cache?: T | null;
}

export const GLOBAL_TASK = {
  // 文件夹树更新任务
  dirUpdate: {
    loading: false,
    cache: null,
  } as BaseTask<ApiResponseDataTypes<'dirUpdate'>>,
  // 清除文件缩略图任务
  clearPoster: {
    loading: false,
  } as BaseTask,
};

type GlobalTask = typeof GLOBAL_TASK;
type TaskName = keyof GlobalTask;

export const setTaskLoading = function <T extends TaskName>(name: T, loading: boolean) {
  GLOBAL_TASK[name].loading = loading;
};

export const getTaskLoading = function <T extends TaskName>(name: T) {
  return GLOBAL_TASK[name].loading;
};

export const setTaskCache = function <T extends TaskName>(name: T, cache: GlobalTask[T]['cache']) {
  GLOBAL_TASK[name].cache = cache;
};

export const getTaskCache = function <T extends TaskName>(name: T) {
  return GLOBAL_TASK[name].cache;
};

export const getTask = function <T extends TaskName>(name: T) {
  return GLOBAL_TASK[name];
};
