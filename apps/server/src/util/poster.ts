import { ERROR_MSG } from '#pkgs/i18n/errorMsg';
import { MediaDetailInfo } from '#pkgs/shared';
import { execCommand } from '#pkgs/tools/cli';
import { DEFAULT_AUDIO_POSTER_RATIO, detectFileType, logError } from '#pkgs/tools/common';
import path from 'node:path';
import { POSTER_FILE_EXT, POSTER_FILE_NAME_PREFIX, POSTER_MAX_SIZE } from '../config';

export const POSTER_FRAME_TIME_RULES: {
  min: number;
  frameTime: number;
}[] = [
  {
    min: 60 * 3,
    frameTime: 15,
  },
  {
    min: 60,
    frameTime: 10,
  },
  {
    min: 30,
    frameTime: 5,
  },
];

// 获取视频封面的帧时间
export const getVideoPosterFrameTime = (duration: number) => {
  let frameTime = 0;

  for (const it of POSTER_FRAME_TIME_RULES) {
    if (duration >= it.min) {
      frameTime = it.frameTime;
      break;
    }
  }

  return frameTime;
};

// 缩略图文件名
export const getPosterFileName = (fileName: string) =>
  `${POSTER_FILE_NAME_PREFIX}${fileName}${POSTER_FILE_EXT}`;

// 生成 poster 的 ffmpeg 的基础命令
const basePosterCommandParam = 'ffmpeg -y -hide_banner -loglevel error';
const scalePosterCommandParam = `-vf "scale='min(${POSTER_MAX_SIZE},iw)':'min(${POSTER_MAX_SIZE},ih)':force_original_aspect_ratio=decrease"`;
const webpCommandParam = '-c:v libwebp -quality 50';

// 截取视频帧，生成缩略图
const getGenerateVideoPosterCommand = async (rawFilePath: string, posterFilePath: string) => {
  // 获取视频时长命令
  const durationCommand = [
    'ffprobe -v error',
    '-show_entries format=duration,format_name',
    // '-of default=noprint_wrappers=1:nokey=1',
    '-print_format json',
    `"${rawFilePath}"`,
  ].join(' ');
  const { stdout } = await execCommand(durationCommand);
  const info = JSON.parse(stdout as string) as MediaDetailInfo;
  const isAvi = info.format.format_name.includes('avi');
  // 视频时长，单位为秒
  const duration = parseFloat(info.format.duration);
  const frameTime = getVideoPosterFrameTime(duration);

  // 生成缩略图命令
  const inputArgs = [`-ss ${frameTime}`, `-i "${rawFilePath}"`];
  // TODO 先如此处理 avi 格式的问题，可能有更好的处理方式
  if (isAvi) inputArgs.reverse();
  return [
    basePosterCommandParam,
    ...inputArgs,
    scalePosterCommandParam,
    '-vframes 1',
    webpCommandParam,
    `"${posterFilePath}"`,
  ];
};

// 获取音频文件的封面，如果文件内包含，则取其封面；否则，创建黑色封面
const getGenerateAudioPosterCommand = async (rawFilePath: string, posterFilePath: string) => {
  // 先判断是否存在封面
  const checkCommand = [
    'ffprobe -v error',
    `-i "${rawFilePath}"`,
    '-select_streams v -show_entries stream=codec_type -of csv=p=0',
  ].join(' ');

  const { stdout } = await execCommand(checkCommand);
  const hasPoster = stdout.includes('video');
  if (hasPoster) {
    // 有封面
    return [
      basePosterCommandParam,
      `-i "${rawFilePath}"`,
      '-map 0:v',
      // scalePosterCommandParam,
      webpCommandParam,
      `"${posterFilePath}"`,
    ];
  } else {
    // 无封面，生成黑色图片
    return [
      basePosterCommandParam,
      '-f lavfi',
      `-i "color=c=black:s=${POSTER_MAX_SIZE}x${DEFAULT_AUDIO_POSTER_RATIO * POSTER_MAX_SIZE}"`,
      '-vframes 1',
      webpCommandParam,
      `"${posterFilePath}"`,
    ];
  }
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
      '-vframes 1',
      webpCommandParam,
      `"${posterFilePath}"`,
    ];
  } else if (fileType === 'video') {
    // 视频类型，生成缩略图命令
    command = await getGenerateVideoPosterCommand(rawFilePath, posterFilePath);
  } else if (fileType === 'audio') {
    // 音频类型，生成缩略图命令
    command = await getGenerateAudioPosterCommand(rawFilePath, posterFilePath);
  } else {
    throw new Error(ERROR_MSG.notCorrectFile);
  }

  try {
    await execCommand(command.join(' '));
  } catch (error) {
    logError(error);
    throw error;
  }
};
