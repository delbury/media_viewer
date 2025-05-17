import { logBase, logInfo } from '#pkgs/tools/common';
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

export const logProgress = (
  total: number,
  { prefix = '', segments = 100 }: { prefix?: string; segments?: number } = {}
) => {
  const step = Math.ceil(total / segments);
  const bar = new ProgressBar(`${prefix}[:bar] :current/:total :percent`, {
    total,
    width: 30,
  });
  return {
    tick: bar.tick,
    goTo: (index: number, singleRow = false) => {
      if (index % step === 0 || index === total - 1) {
        bar.curr = index + 1;
        bar.render();
        if (singleRow) logBase('\n');
        if (index === total - 1) bar.tick(0);
      }
    },
  };
};
