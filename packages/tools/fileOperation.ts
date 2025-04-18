import { access, constants, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { logInfo } from './common.js';
import { IGNORE_FILE_NAME_PREFIX, IGNORE_FILE_NAME_REG } from './constant.js';

// 读文件
export const readDataFromFile = async (fullFilePath: string) => {
  try {
    await access(fullFilePath, constants.F_OK);
  } catch {
    return null;
  }

  const fileContent = await readFile(fullFilePath, { encoding: 'utf8' });
  return fileContent;
};

// 写文件
export const writeDataToFile = async (fullFilePath: string, data: Record<string, unknown>) => {
  logInfo('start writing file');

  const jsonString = JSON.stringify(data ?? {});
  await writeFile(fullFilePath, jsonString);

  logInfo('successfully written file');
};

// 从根目录开始遍历文件夹
export const walkFromRootDirs = async (
  rootDirs: string[] | string | null,
  callback: (
    selfDir: string,
    items: {
      childDirs: string[];
      childFiles: string[];
      ignoreChildDirs: string[];
      ignoreChildFiles: string[];
    }
  ) => void,
  { skipHiddenDir = true }: { skipHiddenDir?: boolean } = {}
) => {
  if (!rootDirs) return;

  const dirs = Array.isArray(rootDirs) ? [...rootDirs] : [rootDirs];
  while (dirs.length) {
    const currentDir = dirs.pop();

    // 跳过隐藏文件夹
    if (skipHiddenDir && IGNORE_FILE_NAME_REG.test(path.basename(currentDir))) continue;

    const files = await readdir(currentDir);
    const childDirs: string[] = [];
    const childFiles: string[] = [];
    const ignoreChildDirs: string[] = [];
    const ignoreChildFiles: string[] = [];

    for (const f of files) {
      const childPath = path.join(currentDir, f);
      const statInfo = await stat(childPath);
      const isIgnore = f.startsWith(IGNORE_FILE_NAME_PREFIX);

      if (statInfo.isDirectory()) {
        (isIgnore ? ignoreChildDirs : childDirs).push(childPath);
      } else if (statInfo.isFile()) {
        (isIgnore ? ignoreChildFiles : childFiles).push(childPath);
      }
    }

    dirs.unshift(...childDirs);
    // 执行回调
    callback(currentDir, { childDirs, childFiles, ignoreChildDirs, ignoreChildFiles });
  }
};
