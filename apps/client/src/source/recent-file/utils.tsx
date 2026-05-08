'use client';

import { ItemOption } from '#/components/ToolGroupBtn';
import { DirectoryInfo, FileInfo } from '#pkgs/apis';
import { INFO_ID_FIELD, findDirInfoInRootDir, splitPath } from '#pkgs/tools/common';
import { AllInclusiveRounded } from '@mui/icons-material';

export const RECENT_FILE_SAME_DIR_COUNT_OPTIONS: ItemOption[] = [
  { label: '1', value: 1 },
  { label: '3', value: 3 },
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  {
    label: (
      <AllInclusiveRounded
        fontSize="inherit"
        style={{ marginTop: '4px' }}
      />
    ),
    value: Infinity,
  },
];

export const RECENT_FILE_OFFSET_OPTIONS: ItemOption[] = [
  { label: '0', value: 0 },
  { label: '100', value: 100 },
  { label: '200', value: 200 },
  { label: '300', value: 300 },
];

export enum RecentMode {
  Preset = 1,
  Custom = 2,
}
export const RECENT_MODE_OPTIONS: ItemOption[] = [
  { label: 'Setting.RecentPresetMode', value: RecentMode.Preset },
  { label: 'Setting.RecentCustomMode', value: RecentMode.Custom },
];
export const createTimeSorter = (a: FileInfo, b: FileInfo) => {
  return b.created - a.created;
};

/**
 * 可以按 video / audio / image 筛选
 * 取最近的 N 个文件
 */
const RECENT_FILE_MAX_COUNT = 100; // N

// 前 L 层相同的文件夹可以合并
const CAN_MERGE_SAME_DIR_COUNT = 3; // L

/**
 * /a/b/c/d/e/f/g
 * /a/b/c/m/p
 * ==>
 * /a/b/c
 *
 * /a/b/c/d/e/f/g
 * /a/b/c/d/t/o
 * ==>
 * /a/b/c/d
 *
 * /a/b/c/d/e/f/g
 * /a/b/y/z
 * xxx
 *
 * /a/b/c/d/e/f/g
 * /1/2/3
 * xxx
 */
const getMergeType = (
  rootDir: DirectoryInfo,
  a: DirectoryInfo,
  b: DirectoryInfo
): DirectoryInfo | null => {
  const pathA = a.showPath + '/';
  const pathB = b.showPath + '/';

  // 父子关系
  if (a.showPath.startsWith(pathB)) return b;
  else if (b.showPath.startsWith(pathA)) return a;

  // 兄弟关系
  const dirsA = splitPath(a.showPath);
  const dirsB = splitPath(b.showPath);
  let curIndex = 0;
  while (curIndex < dirsA.length && curIndex < dirsB.length) {
    if (dirsA[curIndex] === dirsB[curIndex]) {
      curIndex++;
    } else {
      break;
    }
  }

  // 存在相同路径
  if (curIndex >= CAN_MERGE_SAME_DIR_COUNT) {
    const newParent = findDirInfoInRootDir(rootDir, dirsA.slice(0, curIndex));
    return newParent;
  }

  return null;
};

// 获取最近文件并包括父文件夹
export const getRecentFilesWithParentDir = (
  files: FileInfo[],
  parentMap: Record<string, DirectoryInfo>,
  rootDir: DirectoryInfo,
  sameDirMaxCount: number,
  recentOffset: number
) => {
  const map = new Map<DirectoryInfo, FileInfo[]>();

  // 还剩的文件数
  let reset = RECENT_FILE_MAX_COUNT;

  for (let i = recentOffset; i < files.length; i++) {
    // 到达上限，结束
    if (reset <= 0) break;
    // 所属文件夹
    const parent = parentMap[files[i][INFO_ID_FIELD]];

    // 初始化数组
    let list = map.get(parent);
    if (!list) {
      list = [];
      map.set(parent, list);
    }

    // 到达上限，跳过
    if (list.length >= sameDirMaxCount) continue;
    list.push(files[i]);
    reset--;
  }

  /**
   * 合并相同的文件夹
   * n2 遍历，判断当前的 parent 是否可以和其中某个进行合并
   */
  const mergedList: { parent: DirectoryInfo; files: FileInfo[] }[] = [];
  for (const [curParent, curFiles] of map.entries()) {
    let merged = false;
    for (let i = 0; i < mergedList.length; i++) {
      const { parent } = mergedList[i];
      // 判断两个 parent 是否可以合并
      const mergedParent = getMergeType(rootDir, parent, curParent);
      // 无法合并，跳过
      if (!mergedParent) continue;

      mergedList[i].parent = mergedParent;
      // 合并后，合并所有文件
      mergedList[i].files.push(...curFiles);
      merged = true;
      break;
    }
    if (!merged) {
      // 无法合并
      mergedList.push({
        parent: curParent,
        files: curFiles,
      });
    }
  }

  return {
    list: mergedList,
    count: RECENT_FILE_MAX_COUNT - reset,
  };
};
