// client 和 server 通用的工具函数

import chalk from 'chalk';
import { FullFileType } from '../shared';
import { AUDIO_REG, IMAGE_REG, TEXT_REG, VIDEO_REG } from './constant';

// 格式化 path 为 linux 风格
export const formatPath = (p: string) => p.replaceAll('\\', '/');

// 控制台打印日志
export const logInfo = (str: string) => console.info(chalk.blue(str));
export const logSuccess = (str: string) => console.info(chalk.green(str));
export const logWarn = (str: string) => console.info(chalk.yellow(str));
export const logError = console.error;

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
type TaskFn = () => Promise<void>;
export const createAsyncTaskQueue = (concurrency: number = 1) => {
  if (concurrency < 1) throw new Error('concurrency must >= 1');

  // 任务队列
  const waitingTasks: TaskFn[] = [];
  // 正在运行的任务
  const runnings: Promise<void>[] = Array(concurrency).fill(null);

  const result = Promise.withResolvers<void>();

  // 添加任务
  const add = (task: TaskFn) => {
    waitingTasks.push(task);
  };

  // 开始任务队列
  const start = async () => {
    if (!waitingTasks.length && runnings.every(t => !t)) {
      result.resolve();
    }

    while (waitingTasks.length) {
      const index = runnings.findIndex(item => !item);
      if (index === -1 || index >= concurrency) return;

      const task = waitingTasks.shift();
      // 开始任务
      const taskPromise = task();
      runnings[index] = taskPromise;

      // 监听任务完成
      taskPromise.finally(() => {
        runnings[index] = null;
        start();
      });
    }
  };

  return { add, start, result: result.promise };
};
