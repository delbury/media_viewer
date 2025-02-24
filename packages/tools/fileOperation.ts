import { access, constants, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { logInfo } from './utils';

// 读文件
export const readDataFromFile = async (dir: string, fileName: string) => {
  const dirInfo = await stat(dir);
  if (!dirInfo || !dirInfo.isDirectory()) throw new Error('dir not exists');

  const fullFilePath = path.resolve(dir, fileName);
  try {
    await access(fullFilePath, constants.F_OK);
  } catch {
    return null;
  }

  const fileContent = await readFile(fullFilePath, { encoding: 'utf8' });
  const jsonData = JSON.parse(fileContent);
  return jsonData;
};

// 写文件
export const writeDataToFile = async (dir: string, fileName: string, data: Record<string, unknown>) => {
  logInfo('start writing file');

  const dirInfo = await stat(dir);
  if (!dirInfo || !dirInfo.isDirectory()) throw new Error('dir not exists');

  const jsonString = JSON.stringify(data ?? {});
  const fullFilePath = path.resolve(dir, fileName);
  await writeFile(fullFilePath, jsonString);

  logInfo('successfully written file');
};
