import { Stats } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { FullFileType, MediaFileType } from '../shared';
import { createFileNameRegExp, detectFileType, formatPath } from './common';
import { IGNORE_FILE_NAME_REG, LYRIC_EXT, SUBTITLES_EXTS, SubtitlesExts } from './constant';

interface CommonInfo {
  // 文件根路径
  basePath?: string;
  // 文件根路径在根目录中的索引
  basePathIndex?: number;
  // 文件相对路径
  relativePath: string;
  // 展示的文件路径
  showPath: string;
  // 文件名
  name: string;
  // 文件创建时间
  created: number;
  // 文件修改时间
  updated: number;
}
export interface FileInfo extends CommonInfo {
  // 文件大小
  size: number;
  // 文件名（不包含扩展名）
  namePure: string;
  // 文件扩展名（包含点）
  nameExt: string;
  // 文件扩展名（不包含点）
  nameExtPure: string;
  // 文件类型
  fileType: FullFileType;
  // 媒体资源的时长
  duration?: number;
  // 歌词文件
  lrcPath?: string;
  // 字幕文件
  subtitles?: {
    basePathIndex?: number;
    lang: string;
    path: string;
    ext: SubtitlesExts;
  }[];
}
// 文件数量统计信息
type FileCount = { [key in MediaFileType]: number };
export interface DirectoryInfo extends CommonInfo {
  // 文件列表
  files: FileInfo[];
  // 子文件夹列表
  children: DirectoryInfo[];
  // 当前文件夹的文件数
  selfFilesCount: number;
  // 当前文件夹和其所有子文件夹的文件数
  totalFilesCount: number;
  selfMediaFilesCount: FileCount;
  totalMediaFilesCount: FileCount;
}
interface NewInfoParams {
  // 文件根路径
  bp?: string;
  // 文件绝对路径
  fp?: string;
  // 文件信息
  info?: Stats;
  // 文件根路径在根目录中的索引
  bpi?: number;
}

// 返回类型
export type TraverseDirectoriesReturnValue = Awaited<ReturnType<typeof traverseDirectories>>;

// 文件和文件夹通用基础信息
const newCommonInfo = ({ bp, fp, info, bpi }: NewInfoParams = {}): CommonInfo => {
  let basePath = formatPath(bp ?? '');
  if (basePath.endsWith('/')) basePath = basePath.slice(0, basePath.length - 1);

  // 文件相对路径
  let relativePath = formatPath(fp ?? '');
  if (relativePath) {
    relativePath = relativePath.replace(basePath, '') || '/';
  }

  return {
    basePath,
    basePathIndex: bpi,
    relativePath,
    showPath: '',
    name: fp ? path.basename(fp) : '',
    created: info?.birthtimeMs ?? 0,
    updated: info?.mtimeMs ?? 0,
  };
};

// 文件信息
const newFileInfo = async (params: NewInfoParams): Promise<FileInfo> => {
  const { ext, name } = path.parse(params.fp ?? '');
  const nameExt = ext.toLowerCase();
  const fileType = detectFileType(ext);

  const fileInfo: FileInfo = {
    ...newCommonInfo(params),
    size: params?.info?.size ?? 0,
    namePure: name,
    nameExt,
    nameExtPure: nameExt.replace('.', ''),
    fileType,
  };

  return fileInfo;
};

// 文件夹信息
const newDirectoryInfo = (params?: NewInfoParams): DirectoryInfo => {
  return {
    ...newCommonInfo(params),
    files: [],
    children: [],
    selfFilesCount: 0,
    totalFilesCount: 0,
    selfMediaFilesCount: {
      audio: 0,
      video: 0,
      image: 0,
    },
    totalMediaFilesCount: {
      audio: 0,
      video: 0,
      image: 0,
    },
  };
};

// 处理同个文件夹下的子文件之间的关系
const resolveFileRelation = (fileInfos: FileInfo[]) => {
  const textFiles: FileInfo[] = [];
  const mediaFiles: FileInfo[] = [];
  fileInfos.forEach(info => {
    switch (info.fileType) {
      case 'text':
        textFiles.push(info);
        break;
      case 'audio':
      case 'video':
        mediaFiles.push(info);
        break;
    }
  });

  mediaFiles.forEach(mediaInfo => {
    const { fileType, namePure } = mediaInfo;
    if (fileType === 'audio') {
      // 音频文件，则查找是否有歌词文件
      const targetFileReg = createFileNameRegExp(namePure, LYRIC_EXT);
      const tf = textFiles.find(tf => targetFileReg.test(tf.name));
      if (tf) mediaInfo.lrcPath = tf.relativePath;
    } else if (fileType === 'video') {
      // 视频文件，查找是否有字幕文件
      const targetFileReg = createFileNameRegExp(namePure, SUBTITLES_EXTS);
      textFiles.forEach(tf => {
        const matched = tf.name.match(targetFileReg);
        if (!matched) return;
        if (!mediaInfo.subtitles) mediaInfo.subtitles = [];
        mediaInfo.subtitles.push({
          basePathIndex: mediaInfo.basePathIndex,
          lang: matched[1],
          ext: matched[2].toLowerCase() as SubtitlesExts,
          path: tf.relativePath,
        });
      });
    }
  });
};

/**
 * 遍历文件夹，生成目录树和文件列表
 * @param dir
 * @returns
 */
export const traverseDirectories = async (
  dir: string | string[],
  options?: { version?: string }
) => {
  // [path1, path2, dirArr, ...]
  // 根目录，去重
  const rootDir = [...new Set(Array.isArray(dir) ? [...dir] : [dir])];

  const dirs: Array<string | DirectoryInfo> = [...rootDir];
  const treeNode: DirectoryInfo = newDirectoryInfo();
  const fileList: FileInfo[] = [];
  const dirList: DirectoryInfo[] = [];
  // 当前的文件夹数组
  let currentDir: DirectoryInfo | null = null;
  dirs.unshift(treeNode);

  while (dirs.length) {
    const d = dirs.shift() as (typeof dirs)[0];

    // 以文件夹对象为分隔点，区分文件夹
    if (typeof d === 'object') {
      currentDir = d;
      continue;
    }

    // 忽略隐藏文件夹或文件
    if (IGNORE_FILE_NAME_REG.test(path.basename(d))) continue;

    // base path
    // 如果当前文件夹没有 basePath，则为根目录，否则使用父目录的 basePath
    const bp = currentDir?.basePath || d;
    const bpi = currentDir?.basePathIndex ?? rootDir.indexOf(bp);
    // full path
    const fp = path.resolve(__dirname, d);

    const info = await stat(fp);
    if (info.isDirectory()) {
      // 是文件夹，创建并保存当前文件夹信息对象
      const dirInfo = newDirectoryInfo({ bp, fp, info, bpi });
      currentDir?.children.push(dirInfo);

      // 将文件夹的子文件压入队列
      dirs.push(dirInfo);
      const childDirs = await readdir(fp);

      // 当前文件夹的所有子文件
      const currentFiles: FileInfo[] = [];
      // 将所有文件夹和文件入队
      for (const cd of childDirs) {
        const cdInfo = await stat(path.resolve(fp, cd));
        if (cdInfo.isDirectory()) {
          // 所有子文件夹信息入队
          dirs.push(path.resolve(fp, cd));
        } else if (cdInfo.isFile()) {
          // 是文件，创建并保存当前文件信息对象
          const fileInfo = await newFileInfo({ bp, fp: path.resolve(fp, cd), info: cdInfo, bpi });
          dirInfo.files.push(fileInfo);
          // 所有文件信息放入数组
          fileList.push(fileInfo);

          // 统计当前文件夹的子文件类型数量
          if (fileInfo.fileType in dirInfo.selfMediaFilesCount) {
            dirInfo.selfMediaFilesCount[fileInfo.fileType as MediaFileType]++;
          }

          // 把当前文件夹的子文件信息集合到一起
          // 后续文件关系判断使用
          currentFiles.push(fileInfo);
        }
      }
      dirInfo.selfFilesCount = dirInfo.files.length;

      resolveFileRelation(currentFiles);

      // 所有文件夹信息放入数组
      dirList.push(dirInfo);
    }
  }

  calcFileCount(treeNode);

  // 额外处理不需要返回的 path 信息
  fileList.forEach(dealFilePath);
  dirList.forEach(dealFilePath);

  return {
    treeNode,
    fileList,
    version: options?.version,
    timestamp: Date.now(),
  };
};

// 处理敏感的文件路径
const dealFilePath = (info: FileInfo | DirectoryInfo) => {
  info.showPath = `/${path.basename(info.basePath ?? '')}${info.relativePath}`;
  info.basePath = void 0;
};

// 递归计算文件数
const calcFileCount = (dirInfo: DirectoryInfo) => {
  let total = dirInfo.selfFilesCount;
  let { audio, image, video } = dirInfo.selfMediaFilesCount;
  for (const child of dirInfo.children) {
    const childCount = calcFileCount(child);
    total += childCount.total;
    audio += childCount.audio;
    image += childCount.image;
    video += childCount.video;
  }
  dirInfo.totalFilesCount = total;
  dirInfo.totalMediaFilesCount.audio = audio;
  dirInfo.totalMediaFilesCount.image = image;
  dirInfo.totalMediaFilesCount.video = video;
  return { total, audio, image, video };
};
