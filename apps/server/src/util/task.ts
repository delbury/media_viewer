import { ApiResponseDataTypes } from '#pkgs/apis';

interface BaseTask<T = unknown> {
  loading: boolean;
  cache?: T | null;
  cacheFilePath?: string;
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

export const getTask = <T extends TaskName>(name: T) => {
  const task = GLOBAL_TASK[name];
  return {
    task,
    start: () => {
      if (task.loading) throw new Error('task in progress');
      task.loading = true;
    },
    end: () => {
      task.loading = false;
    },
    setCache: (cache: GlobalTask[T]['cache']) => {
      task.cache = cache;
    },
    getCache: () => {
      return task.cache as GlobalTask[T]['cache'];
    },
  };
};
