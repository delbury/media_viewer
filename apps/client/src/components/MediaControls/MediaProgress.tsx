import { useMove } from '#/hooks/useMove';
import { ArrowDropDownRounded, ArrowDropUpRounded } from '@mui/icons-material';
import { LinearProgress, linearProgressClasses, SxProps } from '@mui/material';
import { MouseEventHandler, useCallback, useMemo, useRef, useState } from 'react';
import { StyledCursorContainer, StyledProgressContainer } from './style';

const BUFFER_BAR_COLOR = 'var(--mui-palette-grey-600)';
const BUFFER_BAR_COLOR_EMPTY = 'transparent';

interface MediaProgressProps {
  currentTime: number;
  videoDuration: number;
  bufferRanges: [number, number][];
  onGoto?: (time: number) => void;
}

export const MediaProgress = ({
  currentTime,
  videoDuration,
  bufferRanges,
  onGoto,
}: MediaProgressProps) => {
  const progressBarRef = useRef<HTMLElement>(null);
  const [cursorOffset, setCursorOffset] = useState(0);

  useMove({ domRef: progressBarRef, onMove: pos => setCursorOffset(pos[0]) });

  // 当前播放进度
  const currentTimePercent = useMemo(
    () => currentTime && (currentTime / videoDuration) * 100,
    [currentTime, videoDuration]
  );

  // 游标随鼠标移动的位置
  const pointerCursorOffsetSx = useMemo<SxProps>(
    () => ({
      transform: `translate(${cursorOffset}px)`,
    }),
    [cursorOffset]
  );

  // 缓存进度百分比，渐变样式
  // 10 ~ 20, 40 ~ 80
  // 0 - 10 | (10 - 20) | 20 - 40 | (40 - 80) | 80 - 100
  const bufferRangesPercentsBarSx = useMemo<SxProps>(() => {
    const pointers: string[] = [`${BUFFER_BAR_COLOR_EMPTY} 0%`];
    for (const [s, e] of bufferRanges) {
      // 计算百分比
      const sp = ((s / videoDuration) * 100).toFixed(2);
      const ep = ((e / videoDuration) * 100).toFixed(2);

      // 上一段空白段的结束
      pointers.push(`${BUFFER_BAR_COLOR_EMPTY} ${sp}%`);

      // 当前数据段
      pointers.push(`${BUFFER_BAR_COLOR} ${sp}%`);
      pointers.push(`${BUFFER_BAR_COLOR} ${ep}%`);

      // 下一段空白段的开始
      pointers.push(`${BUFFER_BAR_COLOR_EMPTY} ${ep}%`);
    }
    pointers.push(`${BUFFER_BAR_COLOR_EMPTY} 100%`);

    return {
      // 已缓存的进度条颜色，通过 css 渐变来显示分段颜色
      [`& .${linearProgressClasses.bar2}`]: {
        backgroundImage: `linear-gradient(to right, ${pointers.join(',')})`,
      },
    };
  }, [bufferRanges, videoDuration]);

  // 跳转到对应的进度条时刻
  const handleGoto = useCallback<MouseEventHandler<HTMLDivElement>>(
    ev => {
      const { offsetX } = ev.nativeEvent;
      const { offsetWidth } = ev.nativeEvent.target as HTMLElement;
      onGoto?.((offsetX / offsetWidth) * videoDuration);
    },
    [onGoto, videoDuration]
  );

  return (
    <StyledProgressContainer
      ref={progressBarRef}
      onClick={handleGoto}
    >
      <LinearProgress
        variant="buffer"
        value={currentTimePercent}
        valueBuffer={100}
        sx={bufferRangesPercentsBarSx}
      />

      <StyledCursorContainer sx={pointerCursorOffsetSx}>
        <ArrowDropDownRounded />
        <ArrowDropUpRounded />
      </StyledCursorContainer>
    </StyledProgressContainer>
  );
};
