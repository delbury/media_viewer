import { ApiResponseBase } from '#pkgs/apis';
import { detectFileType, logError } from '#pkgs/tools/common';
import { IGNORE_FILE_NAME_REG } from '#pkgs/tools/constant';
import { exec, ExecOptions } from 'node:child_process';
import path from 'node:path';
import {
  LONG_VIDEO_DURATION_THRESHOLD,
  LONG_VIDEO_POSTER_FRAME_TIME,
  POSTER_FILE_EXT,
  POSTER_FILE_NAME_PREFIX,
  POSTER_MAX_SIZE,
  SHORT_VIDEO_POSTER_FRAME_TIME,
} from '../config';
import { ERROR_MSG } from '../i18n/errorMsg';

export const returnBody = <T>(data?: T) => {
  return {
    code: 0,
    data,
  } satisfies ApiResponseBase<T>;
};

export const returnError = <T>(msg: string, code?: number) => {
  return {
    code: code ?? 1,
    msg,
  } satisfies ApiResponseBase<T>;
};

// 执行命令
export const execCommand = (command: string, options?: ExecOptions) => {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      // 错误处理
      if (error) {
        logError(error);
        reject(new Error(ERROR_MSG.commandError));
      }
      resolve({ stdout, stderr });
    });
  });
};

// 隐藏文件或文件夹
export const hideFile = async (filePath: string) => {
  // windows 下隐藏文件
  if (process.platform === 'win32') {
    await execCommand(`attrib +h "${filePath}"`);
  }

  // linux 下隐藏文件，默认传入的文件名已经以 . 开头
  // 这里只做判断，不做重命名
  const fileName = path.basename(filePath);
  if (!IGNORE_FILE_NAME_REG.test(fileName)) {
    return new Error('file name not start with "."');
  }
};

// 缩略图文件名
export const getPosterFileName = (pureFileName: string) =>
  `${POSTER_FILE_NAME_PREFIX}${pureFileName}${POSTER_FILE_EXT}`;

// 生成 poster 的 ffmpeg 的基础命令
const basePosterCommandParam = 'ffmpeg -y -hide_banner -loglevel error';
const scalePosterCommandParam = `-vf "scale='min(${POSTER_MAX_SIZE},iw)':'min(${POSTER_MAX_SIZE},ih)':force_original_aspect_ratio=decrease"`;

// 截取视频帧，生成缩略图
const generateVideoPoster = async (rawFilePath: string, posterFilePath: string) => {
  // 获取视频时长命令
  const durationCommand = [
    'ffprobe -v error',
    '-show_entries format=duration',
    '-of default=noprint_wrappers=1:nokey=1',
    rawFilePath,
  ].join(' ');
  const { stdout } = await execCommand(durationCommand);
  // 视频时长，单位为秒
  const duration = parseFloat(stdout);
  const frameTime =
    duration < LONG_VIDEO_DURATION_THRESHOLD
      ? SHORT_VIDEO_POSTER_FRAME_TIME
      : LONG_VIDEO_POSTER_FRAME_TIME;

  // 生成缩略图命令
  return [
    basePosterCommandParam,
    `-i "${rawFilePath}"`,
    `-ss ${frameTime}`,
    scalePosterCommandParam,
    '-vframes 1 -q:v 5',
    `"${posterFilePath}"`,
  ];
};

// 生成缩略图封面
export const generatePoster = async (rawFilePath: string, posterFilePath: string) => {
  const fileType = detectFileType(path.extname(rawFilePath));

  let command: string[] = [];

  if (fileType === 'image') {
    // 图片类型，生成缩略图命令
    command = [
      basePosterCommandParam,
      `-i "${rawFilePath}"`,
      scalePosterCommandParam,
      '-q:v 5',
      `"${posterFilePath}"`,
    ];
  } else if (fileType === 'video') {
    // 视频类型，生成缩略图命令
    command = await generateVideoPoster(rawFilePath, posterFilePath);
  } else {
    throw new Error(ERROR_MSG.notAnImageOrVideoFile);
  }

  try {
    await execCommand(command.join(' '));
  } catch (error) {
    logError(error);
    throw error;
  }
};
