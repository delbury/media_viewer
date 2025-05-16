import { logInfo } from '#pkgs/tools/common';
import ProgressBar from 'progress';

export const logCommand = (cli: string, args: string[]) => {
  const cmd = `${cli} ${args
    .map(arg => {
      if (/[ \t\n'"$&|<>]/.test(arg)) {
        // 检测包含特殊字符
        return `"${arg}"`; // 单引号包裹并转义内部单引号
      }
      return arg;
    })
    .join(' ')}`;

  logInfo(cmd);

  return cmd;
};

export const logProgress = (total: number, { prefix = '' }: { prefix?: string } = {}) => {
  const bar = new ProgressBar(`${prefix}[:bar] :current/:total :percent`, {
    total,
    width: 30,
  });
  return bar;
};
