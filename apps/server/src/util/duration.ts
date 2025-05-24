import { execCommand } from '#pkgs/tools/cli';
import {
  createAsyncTaskQueue,
  createTimer,
  INFO_ID_FIELD,
  logBaseWarn,
  logError,
  logInfo,
  logSuccess,
  logWarn,
} from '#pkgs/tools/common';
import genericPool from 'generic-pool';
import { isNil } from 'lodash-es';
import { spawn } from 'node:child_process';
import { default as os } from 'node:os';
import { logProgress } from './debug';
import { getFilePath } from './file';
import { getTask } from './task';
import { FileInfo } from './traverseDirectories';

const durationTask = getTask('getDuration');
const updateTask = getTask('dirUpdate');

const BASE_COMMAND = [
  'ffprobe -v error',
  '-probesize 32K -analyzeduration 100000',
  '-select_streams v:0',
  '-show_entries format=duration',
  '-of default=noprint_wrappers=1:nokey=1',
].join(' ');

const SAVE_PER_FILE_COUNT = 500;

// 获取视频文件的时长
export const attachVideoFilesDuration = async (
  fileInfos: FileInfo[],
  cacheMap: Record<string, number>
) => {
  // 出错的文件
  const errorFilePath: { path: string; info: FileInfo }[] = [];
  // 任务队列
  const taskQueue = createAsyncTaskQueue(os.cpus().length * 3);
  // 新的缓存，用来去掉已不存在文件的视频时长
  const pureCacheMap: Record<string, number> = {};

  for (let i = 0; i < fileInfos.length; i++) {
    // 过滤非视频文件
    if (fileInfos[i].fileType !== 'video') continue;

    const cacheKey = fileInfos[i][INFO_ID_FIELD];

    // 取缓存
    const cachedDuration = cacheMap[cacheKey];
    if (!isNil(cachedDuration)) {
      fileInfos[i].duration = cachedDuration;
      pureCacheMap[cacheKey] = cachedDuration;
      continue;
    }

    // 任务队列
    const task = async (index: number) => {
      const filePath = getFilePath(fileInfos[i]);
      const command = `${BASE_COMMAND} "${filePath}"`;
      try {
        const { stdout } = await execCommand(command, { quitWhenError: true });
        const duration = +stdout;
        // *! 直接修改引用值
        fileInfos[i].duration = duration;
        // *! 直接修改引用值，设置缓存
        cacheMap[cacheKey] = duration;
        pureCacheMap[cacheKey] = duration;
      } catch {
        logWarn('get file duration failed');
        errorFilePath.push({
          path: filePath,
          info: fileInfos[i],
        });
      }

      // 每隔一批任务，保存一下缓存文件
      if (index && index % SAVE_PER_FILE_COUNT === 0) {
        await durationTask.saveCache();
        logSuccess('save duration cache successfully');
      }

      // 更新进度条
      progressbar.goTo(index, true);
    };
    taskQueue.add(task);
  }

  // 开启进度条
  const progressbar = logProgress(taskQueue.getTotalCount());
  // 开始任务
  taskQueue.start();
  await taskQueue.result;
  if (errorFilePath.length) logBaseWarn('some command were failed: ', errorFilePath);
  // 更新所有文件的本地缓存
  await updateTask.saveCache();
  // 更新视频时长的本地缓存
  durationTask.setCache(pureCacheMap);
  await durationTask.saveCache();
};

// 异步查询视频时长并保存
export const asyncVideoFileDurationTask = async (fileInfos: FileInfo[]) => {
  // 已有任务正在进行，直接跳过不报错
  if (durationTask.task.loading) return;

  try {
    // 性能记录
    logInfo('start get files duration');
    const durationStop = createTimer();

    durationTask.start();
    // 获取缓存
    const cache = (await durationTask.getCache()) ?? {};
    // 重新设置一下，防止一开始为 null 时，cache 为新建的空对象
    durationTask.setCache(cache);
    await attachVideoFilesDuration(fileInfos, cache);

    logSuccess('get files duration done: ', durationStop());
  } finally {
    durationTask.end();
  }
};

// shell 进程池
export const createShellPool = () => {
  const pool = genericPool.createPool(
    {
      create: async () => {
        const ps = spawn('powershell.exe', ['-NoLogo', '-NonInteractive', '-Command', '-'], {
          // shell: true,
          stdio: ['pipe', 'pipe', 'pipe'],
          env: {
            ...process.env, // 继承当前环境变量
            LC_ALL: 'zh_CN.UTF-8', // 强制区域和语言为中文 UTF-8
            PYTHONIOENCODING: 'utf-8', // 影响部分 CLI 工具（如 ffprobe）
            PSRP_UTF8OUTPUT: '1', // 确保 PowerShell 远程协议使用 UTF-8
          },
        });

        return ps;
      },
      destroy: async client => {
        client.kill('SIGTERM');
      },
    },
    {
      max: os.cpus().length,
      min: 1,
    }
  );

  return pool;
};

const END_MARKER = '_END_MARKER_';
// 通过进程池获取视频时长
export const attachVideoFilesDurationByPool = async (fileInfos: FileInfo[]) => {
  const pool = createShellPool();

  // 进度条
  const progressbar = logProgress(fileInfos.length);

  for (let i = 0; i < fileInfos.length; i++) {
    const fileInfo = fileInfos[i];
    // 获取进程
    const ps = await pool.acquire();
    try {
      const { promise, reject, resolve } = Promise.withResolvers<number>();

      let stdout = '';

      ps.stdout.on('data', data => {
        stdout += data;
        if (stdout.includes(END_MARKER)) {
          resolve(parseFloat(stdout));
        }
      });

      ps.stderr.on('data', data => {
        logError(data + '');
        reject(data);
      });

      ps.once('error', err => {
        logError(err);
        reject(err);
      });

      // 发送命令
      const filePath = getFilePath(fileInfo);
      const command = [`${BASE_COMMAND} "${filePath}"`, `echo ${END_MARKER}`].join('\n') + '\r\n';
      ps.stdin.write(command);
      const duration = await promise;

      // 设置时长
      fileInfo.duration = duration;
      progressbar.goTo(i);
    } finally {
      // 释放进程
      ps.stdout.removeAllListeners('data');
      ps.stderr.removeAllListeners('data');
      ps.removeAllListeners('error');
      pool.release(ps);
    }
  }

  await pool.drain();
  await pool.clear();
};
