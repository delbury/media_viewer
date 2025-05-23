import {
  DIRECTORY_ROOTS,
  POSTER_CACHE_MAX_AGE,
  POSTER_DIR_NAME,
  POSTER_FILE_EXT,
  POSTER_FILE_NAME_PREFIX,
  RAW_IMAGE_FOR_POSTER_MAX_SIZE,
} from '#/config';
import { walkFromRootDirs } from '#/util/fileOperation';
import { API_CONFIGS, ApiRequestParamsTypes } from '#pkgs/apis';
import { ERROR_MSG } from '#pkgs/i18n/errorMsg';
import {
  ALLOWED_POSTER_FILE_TYPES,
  createAsyncTaskQueue,
  detectFileType,
  logSuccess,
} from '#pkgs/tools/common';
import Router from '@koa/router';
import send from 'koa-send';
import { noop } from 'lodash-es';
import { access, mkdir, readdir, rm, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import os from 'os';
import { returnBody } from '../util/common';
import { getRootDir, hideFile } from '../util/file';
import { generatePoster, getPosterFileName } from '../util/poster';
import { getTask } from '../util/task';

const posterRouter = new Router();
const clearPosterTask = getTask('clearPoster');

// 返回缩略图
posterRouter[API_CONFIGS.posterGet.method](API_CONFIGS.posterGet.url, async ctx => {
  const { basePathIndex, relativePath, force } = ctx.query as ApiRequestParamsTypes<'posterGet'>;

  // 强制更新
  const forceUpdate = force === 'true';

  // 校验根目录
  const basePath = getRootDir(basePathIndex);

  // 校验文件类型
  const fileType = detectFileType(relativePath);
  if (!ALLOWED_POSTER_FILE_TYPES.includes(fileType)) throw new Error(ERROR_MSG.notCorrectFile);

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
posterRouter[API_CONFIGS.posterClear.method](API_CONFIGS.posterClear.url, async ctx => {
  const { clearAll } = ctx.request.body as ApiRequestParamsTypes<'posterClear'>;

  let removedOldFiles = 0;
  let removedDirs = 0;
  let removedFiles = 0;

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
              removedOldFiles++;
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
                removedDirs++;
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
                removedFiles++;
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

    logSuccess(
      `removed old files: ${removedOldFiles}, dirs: ${removedDirs}, files: ${removedFiles}`
    );

    ctx.body = returnBody();
  } finally {
    clearPosterTask.end();
  }
});

export { posterRouter };
