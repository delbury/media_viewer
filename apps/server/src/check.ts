import { sync } from 'command-exists';

const getNoCommandErrorMsg = (command: string) => `current environment has no ${command} command`;

const check = () => {
  // 检查当前运行环境
  if (process.platform === 'win32') {
    if (!sync('attrib')) throw new Error(getNoCommandErrorMsg('attrib'));
  }
  if (!sync('ffmpeg')) throw new Error(getNoCommandErrorMsg('ffmpeg'));
};

check();
