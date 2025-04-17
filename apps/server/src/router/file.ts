import {
  DIRECTORY_ROOTS,
  POSTER_CACHE_MAX_AGE,
  POSTER_DIR_NAME,
  POSTER_FILE_EXT,
  POSTER_FILE_NAME_PREFIX,
  RAW_IMAGE_FOR_POSTER_MAX_SIZE,
  TEXT_FILE_SIZE_LIMIT,
} from '#/config';
import { API_CONFIGS, ApiRequestParamsTypes, ApiResponseDataTypes } from '#pkgs/apis';
import {
  ALLOWED_POSTER_FILE_TYPES,
  createAsyncTaskQueue,
  detectFileType,
  logSuccess,
} from '#pkgs/tools/common';
import { readDataFromFile, walkFromRootDirs } from '#pkgs/tools/fileOperation';
import Router from '@koa/router';
import send from 'koa-send';
import { noop } from 'lodash-es';
import { access, mkdir, readdir, rm, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import os from 'os';
import { ERROR_MSG } from '../i18n/errorMsg';
import { hideFile, returnBody } from '../util/common';
import { generatePoster, getPosterFileName } from '../util/poster';
import { sendFileWithRange } from '../util/range';
import { getTask } from '../util/task';
import { transforVideoStream } from '../util/video';

const fileRouter = new Router();

const clearPosterTask = getTask('clearPoster');

// 视频文件的降级地址，转码并返回
fileRouter[API_CONFIGS.fileVideoFallback.method](API_CONFIGS.fileVideoFallback.url, async ctx => {
  const { basePathIndex, relativePath } = ctx.query as ApiRequestParamsTypes<'fileVideoFallback'>;

  // 校验根目录
  const basePath = DIRECTORY_ROOTS[+basePathIndex];
  if (!basePath) throw new Error(ERROR_MSG.noRootDir);

  // 校验文件路径的合法性
  const fullPath = path.posix.join(basePath, relativePath);
  if (!fullPath.startsWith(basePath)) throw new Error(ERROR_MSG.errorPath);

  // 校验文件类型
  const fileType = detectFileType(relativePath);
  if (fileType !== 'video') throw new Error(ERROR_MSG.notAnVideoFile);

  transforVideoStream(ctx, fullPath);
});

// 返回文件的文本内容
fileRouter[API_CONFIGS.fileText.method](API_CONFIGS.fileText.url, async ctx => {
  const { basePathIndex, relativePath } = ctx.query as ApiRequestParamsTypes<'fileText'>;

  // 校验根目录
  const basePath = DIRECTORY_ROOTS[+basePathIndex];
  if (!basePath) throw new Error(ERROR_MSG.noRootDir);

  // 校验文件路径的合法性
  const fullPath = path.posix.join(basePath, relativePath);
  if (!fullPath.startsWith(basePath)) throw new Error(ERROR_MSG.errorPath);

  const fileInfo = await stat(fullPath);
  if (fileInfo.size > TEXT_FILE_SIZE_LIMIT) throw new Error(ERROR_MSG.sizeLimited);

  const content = await readDataFromFile(fullPath);

  ctx.body = returnBody<ApiResponseDataTypes<'fileText'>>({ content });
});

// 返回文件
fileRouter[API_CONFIGS.fileGet.method](API_CONFIGS.fileGet.url, async ctx => {
  const { basePathIndex, relativePath } = ctx.query as ApiRequestParamsTypes<'fileGet'>;

  // 校验根目录
  const basePath = DIRECTORY_ROOTS[+basePathIndex];
  if (!basePath) throw new Error(ERROR_MSG.noRootDir);

  // 校验文件路径的合法性
  const fullPath = path.posix.join(basePath, relativePath);
  if (!fullPath.startsWith(basePath)) throw new Error(ERROR_MSG.errorPath);

  // 处理带 Range 头的请求
  const useRange = await sendFileWithRange(ctx, fullPath);

  // 没有 Range
  if (useRange === false) {
    await send(ctx, relativePath, {
      root: basePath,
      maxAge: POSTER_CACHE_MAX_AGE,
      hidden: false,
    });
  }
});

// 返回缩略图
fileRouter[API_CONFIGS.filePoster.method](API_CONFIGS.filePoster.url, async ctx => {
  const { basePathIndex, relativePath, force } = ctx.query as ApiRequestParamsTypes<'filePoster'>;

  // 强制更新
  const forceUpdate = force === 'true';

  // 校验根目录
  const basePath = DIRECTORY_ROOTS[+basePathIndex];
  if (!basePath) throw new Error(ERROR_MSG.noRootDir);

  // 校验文件类型
  const fileType = detectFileType(relativePath);
  if (!ALLOWED_POSTER_FILE_TYPES.includes(fileType)) throw new Error(ERROR_MSG.notAnCorrectFile);

  // 校验文件路径的合法性
  const fullPath = path.posix.join(basePath, relativePath);
  if (!fullPath.startsWith(basePath)) throw new Error(ERROR_MSG.errorPath);

  // send 方法的相对路径
  let sendFileRelativePath = relativePath;

  const fileStat = await stat(fullPath);
  // base: /a/b/c
  // relative: ./d/e/f.jpg
  // currentDir: ./d/e
  // posterDir: ./d/e/poster_dir
  // posterFile: ./d/e/poster_dir/poster_f.jpg
  // 图片类型的文件，根据文件大小来判断是否生成缩略图
  // 视频类型的文件，需要生成缩略图
  if (
    (fileType === 'image' && fileStat.size > RAW_IMAGE_FOR_POSTER_MAX_SIZE) ||
    fileType === 'video' ||
    fileType === 'audio'
  ) {
    let hasPoster = false;
    // 当前文件夹相对路径
    const currentDir = path.dirname(relativePath);
    // 缩略图文件夹相对路径
    const posterDir = path.join(currentDir, POSTER_DIR_NAME);
    // 缩略图相对路径
    const relativePosterFilePath = path.join(
      posterDir,
      getPosterFileName(path.basename(relativePath))
    );
    // 缩略图绝对路径
    const fullPosterFilePath = path.join(basePath, relativePosterFilePath);

    if (!forceUpdate) {
      try {
        // 判断缩略图是否存在
        await access(fullPosterFilePath);
        hasPoster = true;
      } catch {
        //
      }
    }

    if (hasPoster) {
      // 有缩略图，则读取
      sendFileRelativePath = relativePosterFilePath;
    } else {
      // 无缩略图，则创建
      const posterDirFullPath = path.join(basePath, posterDir);
      // 创建文件夹
      await access(posterDirFullPath)
        .catch(() => mkdir(posterDirFullPath).then(() => hideFile(posterDirFullPath)))
        .catch(noop);

      await generatePoster(fullPath, fullPosterFilePath);
      sendFileRelativePath = relativePosterFilePath;
    }
  }

  await send(ctx, sendFileRelativePath, {
    root: basePath,
    maxAge: POSTER_CACHE_MAX_AGE,
    hidden: true,
  });
});

// 清除缩略图，默认只清除无用的缩略图
fileRouter[API_CONFIGS.filePosterClear.method](API_CONFIGS.filePosterClear.url, async ctx => {
  const { clearAll } = ctx.request.body as ApiRequestParamsTypes<'filePosterClear'>;

  try {
    clearPosterTask.start();
    // 任务队列
    const tasks = createAsyncTaskQueue(os.cpus().length);
    await walkFromRootDirs(
      DIRECTORY_ROOTS,
      async (self, { childFiles, ignoreChildDirs, ignoreChildFiles }) => {
        // 处理文件，删除直接在当前目录的下的缩略图
        // （旧版是放在当前目录下，新版是放在当前目录的专门的文件夹下）
        ignoreChildFiles.forEach(async file => {
          const fileName = path.basename(file);
          // 删除专用文件夹外的缩略图文件
          if (fileName !== POSTER_DIR_NAME && fileName.startsWith(POSTER_FILE_NAME_PREFIX)) {
            tasks.add(async () => {
              await unlink(file);
              logSuccess(`removed poster (old): ${file}`);
            });
          }
        });

        // 处理文件夹
        if (clearAll) {
          // 处理文件夹，强制删除时，直接整个删除
          ignoreChildDirs.forEach(async dir => {
            if (path.basename(dir) === POSTER_DIR_NAME) {
              tasks.add(async () => {
                await rm(dir, { recursive: true });
                logSuccess(`removed dir: ${dir}`);
              });
            }
          });
          return;
        }

        // 非强制删除时，只删除没有对应文件的缩略图
        try {
          const posterDir = path.join(self, POSTER_DIR_NAME);
          await access(posterDir);
          const posterFiles = await readdir(posterDir);
          const childFilesSet = new Set(childFiles.map(file => path.basename(file)));

          posterFiles.forEach(async posterName => {
            if (
              !childFilesSet.has(
                path.basename(posterName.replace(POSTER_FILE_NAME_PREFIX, ''), POSTER_FILE_EXT)
              )
            ) {
              const fp = path.join(posterDir, posterName);
              tasks.add(async () => {
                await rm(fp);
                logSuccess(`removed poster: ${fp}`);
              });
            }
          });
        } catch {
          // 没有缩略图文件夹，无操作
        }
      }
    );
    tasks.start();
    await tasks.result;

    ctx.body = returnBody();
  } finally {
    clearPosterTask.end();
  }
});

export { fileRouter };
