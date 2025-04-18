import { ParameterizedContext } from 'koa';
import mime from 'mime';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { ERROR_MSG } from '../i18n/errorMsg';

// 每次的最大 size
const MAX_RANGE_SIZE_STEP = 2 ** 22;

// 处理 Range 头
export const sendFileWithRange = async (ctx: ParameterizedContext, filePath: string) => {
  const range = ctx.request.header.range as string;
  if (!range) return false;

  const positions = range.replace(/bytes=/, '').split('-');

  // 获取文件信息
  let fileInfo = null;
  try {
    fileInfo = await stat(filePath);
  } catch {
    throw new Error(ERROR_MSG.noFile);
  }

  const total = fileInfo ? fileInfo.size : 0;
  const start = Number(positions[0]);
  let end = Number(positions[1] || total - 1);
  if (positions[1]) {
    end = Math.min(Number(positions[1]), start + MAX_RANGE_SIZE_STEP);
  } else {
    end = start + MAX_RANGE_SIZE_STEP;
    if (end > total - 1) {
      end = total - 1;
    }
  }
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${total}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': (end - start + 1).toString(),
    'Content-Type': mime.getType(filePath) ?? '',
  };

  // 视频流
  const vs = createReadStream(filePath, {
    start,
    end,
  });
  await new Promise<void>((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    let size = 0;
    vs.on('data', data => {
      if (typeof data === 'string') return;

      chunks.push(data);
      size += data.length;
    });
    vs.on('end', () => {
      const buffer = Buffer.concat(chunks, size);
      ctx.status = start === 0 && end === 1 ? 200 : 206;
      ctx.set(headers);
      ctx.body = buffer;
      resolve();
    });
    vs.on('error', () => {
      reject();
    });
  });
};
