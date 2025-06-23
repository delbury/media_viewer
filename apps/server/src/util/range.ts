import { ERROR_MSG } from '#pkgs/i18n/errorMsg';
import { FIFO } from '#pkgs/tools/cahceStrategy';
import { ParameterizedContext } from 'koa';
import mime from 'mime';
import { createReadStream, Stats } from 'node:fs';
import { stat } from 'node:fs/promises';

const fileStatFifo = new FIFO<Stats>(8);

// 每次的最大 size，MB
const MAX_RANGE_SIZE_STEP = 4 * 2 ** 20;

// 获取文件的单次 range 大小
const BASE_BIG_FILE_SIZE_THRESHOLD = 2 ** 30;
// 倍数，index + 2
const BIG_FILE_SIZE_THRESHOLD_SCALES = [1.5, 5, 10];
const getFileStep = (fileInfo: Stats) => {
  let multi = 1;
  for (let i = BIG_FILE_SIZE_THRESHOLD_SCALES.length; i >= 0; i--) {
    if (fileInfo.size > BIG_FILE_SIZE_THRESHOLD_SCALES[i] * BASE_BIG_FILE_SIZE_THRESHOLD) {
      multi = i + 2;
      break;
    }
  }
  return multi * MAX_RANGE_SIZE_STEP;
};

// 解析 Range 头
export const resolveRange = async (range: string, filePath: string) => {
  const positions = range.replace(/bytes=/, '').split('-');

  // 获取文件信息
  let fileInfo = await fileStatFifo.get(filePath);
  if (!fileInfo) {
    try {
      fileInfo = await stat(filePath);
      fileStatFifo.set(filePath, fileInfo);
    } catch {
      throw new Error(ERROR_MSG.noFile);
    }
  }
  // 单个请求的最大大小
  const sizeStep = getFileStep(fileInfo);
  const total = fileInfo ? fileInfo.size : 0;
  const start = Number(positions[0]);
  let end = Number(positions[1] || total - 1);
  if (positions[1]) {
    end = Math.min(Number(positions[1]), start + sizeStep);
  } else {
    end = start + sizeStep;
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

  return {
    headers,
    start,
    end,
  };
};

// 发送带 Range 头的文件
export const sendFileWithRange = async (ctx: ParameterizedContext, filePath: string) => {
  const range = ctx.request.header.range;
  if (!range) return false;

  const { headers, start, end } = await resolveRange(range, filePath);

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
