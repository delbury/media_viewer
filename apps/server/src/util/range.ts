import { ERROR_MSG } from '#pkgs/i18n/errorMsg';
import { FIFO } from '#pkgs/tools/cahceStrategy';
import { VIDEO_REG } from '#pkgs/tools/constant';
import { ParameterizedContext } from 'koa';
import { clamp } from 'lodash-es';
import mime from 'mime';
import { createReadStream, Stats } from 'node:fs';
import { stat } from 'node:fs/promises';
import { getMediaDetail } from './media';

const fileStatFifo = new FIFO<Stats>(8);

// MB
const MB = 2 ** 20;
// 每次的最大 size，MB
const BASE_RANGE_SIZE_STEP = 4 * MB;
// 获取文件的单次 range 大小
const BASE_BIG_FILE_SIZE_THRESHOLD = 32 * MB;
// 倍数，index + 2
const BIG_FILE_SIZE_THRESHOLD_SCALES = [1.5, 5, 10];

// 每个 range 分片的秒数
const RANGE_STEP_SECONDS = 4;
// 最大 range 分片大小
const RANGE_STEP_MAX = 60 * MB;

const getFileStep = (fileSize: number) => {
  let multi = 1;
  for (let i = BIG_FILE_SIZE_THRESHOLD_SCALES.length; i >= 0; i--) {
    if (fileSize > BIG_FILE_SIZE_THRESHOLD_SCALES[i] * BASE_BIG_FILE_SIZE_THRESHOLD) {
      multi = i + 2;
      break;
    }
  }
  return multi * BASE_RANGE_SIZE_STEP;
};

// 解析 Range 头
export const resolveRange = async (range: string, filePath: string) => {
  const positions = range.replace(/bytes=/, '').split('-');

  const isVideo = VIDEO_REG.test(filePath);
  let fileSize = 0;
  // 单个请求的最大大小
  let sizeStep = BASE_RANGE_SIZE_STEP;

  if (isVideo) {
    const videoDetail = await getMediaDetail(filePath);
    fileSize = +(videoDetail?.format.size ?? '');
    const bitRate = Math.ceil(+(videoDetail?.format.bit_rate ?? '') / 8);
    // 根据视频码率，限制单个请求的最大大小
    sizeStep = clamp(bitRate * RANGE_STEP_SECONDS, BASE_RANGE_SIZE_STEP, RANGE_STEP_MAX);
  } else {
    // 获取文件信息
    let fileInfo = await fileStatFifo.get(filePath);
    if (!fileInfo) {
      try {
        fileInfo = await stat(filePath);
        fileStatFifo.set(filePath, fileInfo);
        fileSize = fileInfo.size;
      } catch {
        throw new Error(ERROR_MSG.noFile);
      }
    }
    sizeStep = getFileStep(fileSize);
  }

  const total = fileSize;
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
