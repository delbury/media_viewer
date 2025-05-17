import { ApiResponseDataTypes } from '#pkgs/apis';
import { ERROR_MSG } from '#pkgs/i18n/errorMsg';
import { logInfo, logSuccess } from '#pkgs/tools/common';
import { CACHE_DATA_VIDEO_DURATION_FULL_PATH, CACHE_DATE_FILE_FULL_PATH } from '../config';
import { readDataFromFileByMsgPack, writeDataToFileByMsgPack } from './fileOperation';

interface BaseTask<T extends Record<string, unknown> = Record<string, unknown>> {
  loading: boolean;
  cache?: T | null;
  cacheFilePath?: string;
}

export const GLOBAL_TASK = {
  // 文件夹树更新任务
  dirUpdate: {
    loading: false,
    cache: null,
    cacheFilePath: CACHE_DATE_FILE_FULL_PATH,
  } as BaseTask<ApiResponseDataTypes<'dirUpdate'>>,
  // 清除文件缩略图任务
  clearPoster: {
    loading: false,
    cache: null,
  } as BaseTask,
  deleteFile: {
    loading: false,
    cache: null,
  } as BaseTask,
  // 视频文件的时长信息缓存，因为是异步获取，所以需要缓存
  getDuration: {
    loading: false,
    cache: null,
    cacheFilePath: CACHE_DATA_VIDEO_DURATION_FULL_PATH,
  } as BaseTask<Record<string, number>>,
} satisfies Record<string, BaseTask>;

type GlobalTask = typeof GLOBAL_TASK;
type TaskName = keyof GlobalTask;

export const getTask = <T extends TaskName>(name: T) => {
  const task = GLOBAL_TASK[name];
  return {
    task,
    start: () => {
      if (task.loading) throw new Error(ERROR_MSG.taskInProgress);
      task.loading = true;
    },
    end: () => {
      task.loading = false;
    },
    setCache: (cache: GlobalTask[T]['cache']) => {
      task.cache = cache;
    },
    getCache: async () => {
      // 优先取内存缓存
      let data = task.cache as GlobalTask[T]['cache'];

      // 取本地缓存
      if (!data && task.cacheFilePath) {
        data = (await readDataFromFileByMsgPack(task.cacheFilePath)) as GlobalTask[T]['cache'];

        // 缓存到内存
        task.cache = data;
      }

      return data;
    },
    saveCache: async () => {
      if (task.cacheFilePath && task.cache) {
        // 更新文件信息缓存文件
        logInfo('start writing file: ', task.cacheFilePath);
        await writeDataToFileByMsgPack(task.cacheFilePath, task.cache);
        logSuccess('written file successfully');
      }
    },
  };
};
