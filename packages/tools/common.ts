// client 和 server 通用的工具函数

import chalk from 'chalk';
import { escapeRegExp, noop } from 'lodash-es';
import { DirectoryInfo, FileInfo } from '../../apps/server/src/util/traverseDirectories';
import { FullFileType, MediaFileType } from '../shared';
import { AUDIO_REG, IMAGE_REG, TEXT_REG, VIDEO_REG } from './constant';

// 文件信息的 id 字段
export const FILE_INFO_ID_FIELD: Extract<keyof FileInfo, 'showPath'> = 'showPath';

// 有缩略图的文件类型
export const ALLOWED_POSTER_FILE_TYPES: FullFileType[] = ['image', 'audio', 'video'];

// 判断是否是媒体文件
export const isMediaFile = (type: FullFileType) => ALLOWED_POSTER_FILE_TYPES.includes(type);

// 默认的高/宽比
export const DEFAULT_RATIO = 0.5625;
export const DEFAULT_AUDIO_POSTER_RATIO = 0.5625;

// 格式化 path 为 linux 风格
export const formatPath = (p: string) => p.replaceAll('\\', '/');

// 将路径字符串拆分为数组
export const splitPath = (p: string, { ignoreLast }: { ignoreLast?: boolean } = {}) => {
  return p.split(/[\\/]/).filter((it, i, list) => {
    if (!it) return false;
    return !ignoreLast ? true : i !== list.length - 1;
  });
};

// 根据路径数组，在文件树中找到文件信息
export const findFileInfoInDir = (dir: DirectoryInfo, names: string[]) => {
  let curDir = dir;
  const fileName = names.pop();
  for (const dirName of names) {
    const d = curDir.children.find(c => c.name === dirName);
    if (!d) return null;
    curDir = d;
  }
  const target = curDir.files.find(f => f.name === fileName);
  return target
    ? {
        fileInfo: target,
        parentDirInfo: curDir,
      }
    : null;
};

// 控制台打印日志
export const logInfo = (...args: (string | number)[]) => console.info(chalk.blue(...args));
export const logSuccess = (...args: (string | number)[]) => console.info(chalk.green(...args));
export const logWarn = (...args: (string | number)[]) => console.info(chalk.yellow(...args));
export const logError = console.error;

// log with order
export const createOrderLogs = () => {
  let order = 1;
  const wrapper =
    (logFn: (...args: (string | number)[]) => void) =>
    (...args: (string | number)[]) =>
      logFn(`${order++}.`, ...args);

  return {
    logInfo: wrapper(logInfo),
    logSuccess: wrapper(logSuccess),
    logWarn: wrapper(logWarn),
  };
};

// 执行计时器
export const createTimer = () => {
  const start = performance.now();
  return () => {
    const end = performance.now();
    return end - start;
  };
};

// 根据 flag 来控制是否执行函数
export const switchFnByFlag = <T extends unknown[]>(fn: (...args: T) => void, flag: boolean) => {
  if (flag) return fn;
  return noop as (...args: T) => void;
};

// 判断文件类型
export const detectFileType = (ext: string): FullFileType => {
  if (IMAGE_REG.test(ext)) return 'image';
  if (AUDIO_REG.test(ext)) return 'audio';
  if (VIDEO_REG.test(ext)) return 'video';
  if (TEXT_REG.test(ext)) return 'text';
  return 'other';
};

/**
 * 异步请求队列
 * @param concurrency 并发数
 * @returns
 */
type TaskFn<T> = (index: number, total: number) => Promise<T>;
export const createAsyncTaskQueue = <T = unknown>(concurrency: number = 1) => {
  if (concurrency < 1) throw new Error('concurrency must >= 1');

  // 任务队列
  const waitingTasks: TaskFn<T>[] = [];
  // 任务编号
  let taskOrder = 0;
  // 任务结果
  const taskResults: (T | null)[] = [];
  // 正在运行的任务
  const runnings: (Promise<T> | null)[] = Array(concurrency).fill(null);
  // 执行结果
  const result = Promise.withResolvers<(T | null)[]>();
  // 任务总数
  let totalTaskCount = 0;

  // 添加任务
  const add = (task: TaskFn<T>) => {
    waitingTasks.push(task);
    totalTaskCount++;
  };

  // 开始任务队列
  const start = async () => {
    if (!waitingTasks.length && runnings.every(t => !t)) {
      result.resolve(taskResults);
    }

    while (waitingTasks.length) {
      const index = runnings.findIndex(item => !item);
      if (index === -1 || index >= concurrency) return;

      const task = waitingTasks.shift() as TaskFn<T>;
      const currentTaskIndex = taskOrder;
      taskOrder++;

      // 开始任务
      const taskPromise = task(currentTaskIndex, totalTaskCount);
      runnings[index] = taskPromise;

      // 监听任务完成
      taskPromise
        .then(res => {
          taskResults[currentTaskIndex] = res;
        })
        .catch(err => {
          taskResults[currentTaskIndex] = null;
          logError(err);
        })
        .finally(() => {
          runnings[index] = null;
          start();
        });
    }
  };

  return { add, start, totalTaskCount, result: result.promise };
};

// 构造正则，文件名 + 忽略大小写的后缀名
export const createFileNameRegExp = (pureName: string, ext: string | string[]) => {
  const exts = Array.isArray(ext) ? ext : [ext];
  // [jpg, png] => ([jJ][pP][gG]|[pP][nN][gG])
  const extRule = exts
    .map(e =>
      e
        .split('')
        .map(c => `[${c.toLowerCase()}${c.toUpperCase()}]`)
        .join('')
    )
    .join('|');
  const validPureName = escapeRegExp(pureName);
  const fullRule = `^${validPureName}\\.?(?<middle>.+)?\\.(?<ext>${extRule})$`;
  return new RegExp(fullRule);
};

// 获取随机 index
export const getRandomIndex = (length: number) => Math.floor(Math.random() * length);

// 获取文件夹下的所有文件
export const getAllFiles = (type: MediaFileType, dir: DirectoryInfo, list: FileInfo[] = []) => {
  dir.files.forEach(f => {
    if (f.fileType === type) list.push(f);
  });
  for (const child of dir.children) {
    getAllFiles(type, child, list);
  }
  return list;
};
