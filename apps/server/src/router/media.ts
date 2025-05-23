import {
  API_CONFIGS,
  ApiRequestDataTypes,
  ApiRequestParamsTypes,
  ApiResponseDataTypes,
  FileInfo,
} from '#pkgs/apis';
import { ERROR_MSG } from '#pkgs/i18n/errorMsg';
import { detectFileType, isMediaFile } from '#pkgs/tools/common';
import Router from '@koa/router';
import { omit } from 'lodash-es';
import path from 'node:path';
import { returnBody } from '../util/common';
import { getFileInfo, getRootDir } from '../util/file';
import { getMediaDetail } from '../util/media';
import { getTask } from '../util/task';

const mediaRouter = new Router();

const dislikeListTask = getTask('dislikeList');

// 获取媒体文件的基本信息
mediaRouter[API_CONFIGS.mediaMetadata.method](API_CONFIGS.mediaMetadata.url, async ctx => {
  const { basePathIndex, relativePath } = ctx.query as ApiRequestParamsTypes<'mediaMetadata'>;

  // 校验根目录
  const basePath = getRootDir(basePathIndex);

  // 校验文件路径的合法性
  const fullPath = path.posix.join(basePath, relativePath);
  if (!fullPath.startsWith(basePath)) throw new Error(ERROR_MSG.errorPath);

  // 校验文件类型
  const fileType = detectFileType(relativePath);
  if (!isMediaFile(fileType)) throw new Error(ERROR_MSG.notMediaFile);

  // 获取文件信息
  const fullMetadata = await getMediaDetail(fullPath);
  const fileInfo = omit(fullMetadata, ['format.filename']) ?? null;
  ctx.body = returnBody(fileInfo);
});

// 标记、取消标记为不喜欢
mediaRouter[API_CONFIGS.mediaDislikeSet.method](API_CONFIGS.mediaDislikeSet.url, async ctx => {
  const { basePathIndex, relativePath, dislike } = ctx.request
    .body as ApiRequestDataTypes<'mediaDislikeSet'>;

  // 校验根目录
  const basePath = getRootDir(basePathIndex);

  // 校验文件路径的合法性
  const fullPath = path.posix.join(basePath, relativePath);
  if (!fullPath.startsWith(basePath)) throw new Error(ERROR_MSG.errorPath);

  let list = await dislikeListTask.getCache();
  if (!list) list = dislikeListTask.setCache([]) as FileInfo[];
  const index =
    list?.findIndex(it => it.relativePath === relativePath && it.basePathIndex === basePathIndex) ??
    -1;
  if (dislike) {
    // 设置
    if (index < 0) {
      const { fileInfo } = (await getFileInfo({ basePathIndex, relativePath })) ?? {};
      if (fileInfo) {
        list.push(fileInfo);
        await dislikeListTask.saveCache();
      }
    }
  } else {
    // 取消设置
    if (index > -1) {
      list.splice(index, 1);
      await dislikeListTask.saveCache();
    }
  }

  ctx.body = returnBody<ApiResponseDataTypes<'mediaDislikeSet'>>({ dislike: !!dislike });
});

// 查询不喜欢状态
mediaRouter[API_CONFIGS.mediaDislikeGet.method](API_CONFIGS.mediaDislikeGet.url, async ctx => {
  const { basePathIndex, relativePath } = ctx.query as ApiRequestParamsTypes<'mediaDislikeGet'>;

  // 校验根目录
  const basePath = getRootDir(basePathIndex);

  // 校验文件路径的合法性
  const fullPath = path.posix.join(basePath, relativePath);
  if (!fullPath.startsWith(basePath)) throw new Error(ERROR_MSG.errorPath);

  const list = await dislikeListTask.getCache();
  const dislike = !!list?.find(
    it => it.relativePath === relativePath && it.basePathIndex?.toString() === basePathIndex
  );
  ctx.body = returnBody<ApiResponseDataTypes<'mediaDislikeGet'>>({ dislike });
});

// 返回不喜欢列表
mediaRouter[API_CONFIGS.mediaDislikeList.method](API_CONFIGS.mediaDislikeList.url, async ctx => {
  const list = (await dislikeListTask.getCache()) ?? [];
  ctx.body = returnBody<ApiResponseDataTypes<'mediaDislikeList'>>({ list });
});

// 批量清除不喜欢列表
mediaRouter[API_CONFIGS.mediaDislikeClear.method](API_CONFIGS.mediaDislikeClear.url, async ctx => {
  const { list, clearAll } = ctx.request.body as ApiRequestDataTypes<'mediaDislikeClear'>;

  if (clearAll) {
    // 全部清除
    dislikeListTask.setCache([]);
    await dislikeListTask.saveCache();
  } else if (list?.length) {
    // 批量移除
    const cachedList = await dislikeListTask.getCache();
    const removeKeySet = new Set(list.map(it => `${it.basePathIndex}${it.relativePath}`));
    const newList = cachedList?.filter(
      it => !removeKeySet.has(`${it.basePathIndex}${it.relativePath}`)
    );
    dislikeListTask.setCache(newList ?? []);
    await dislikeListTask.saveCache();
  }

  ctx.body = returnBody();
});

export { mediaRouter };
