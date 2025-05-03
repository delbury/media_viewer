import { useCancelAreaContext } from '#/hooks/useCancelAreaContext';
import { useMove } from '#/hooks/useMove';
import { formatTime } from '#/utils';
import { ArrowDropDownRounded, ArrowDropUpRounded } from '@mui/icons-material';
import { LinearProgress, linearProgressClasses, SxProps } from '@mui/material';
import { MouseEventHandler, useCallback, useMemo, useRef, useState } from 'react';
import { StyleCursorTime, StyledCursorContainer, StyledProgressContainer } from './style';

const BUFFER_BAR_COLOR = 'var(--mui-palette-grey-600)';
const BUFFER_BAR_COLOR_EMPTY = 'transparent';

interface MediaProgressProps {
  currentTime: number;
  videoDuration: number;
  bufferRanges: [number, number][];
  onGoto?: (time: number) => void;
}

// 在移动端拖拽进度条结束时
// 可以触发当前播放进度改变的垂直方向的位置距离元素的相对距离阈值
// const MOBILE_DRAG_END_TRIGGER_THRESHOLD = 80;

export const MediaProgress = ({
  currentTime,
  videoDuration,
  bufferRanges,
  onGoto,
}: MediaProgressProps) => {
  const progressBarRef = useRef<HTMLElement>(null);
  const [cursorOffset, setCursorOffset] = useState(0);
  const [cursorPercent, setCursorPercent] = useState(0);
  const [showCursor, setShowCursor] = useState(false);

  useMove({
    domRef: progressBarRef,
    onMove: (pos, size) => {
      let offset = 0;
      if (pos[0] <= 0) offset = 0;
      else if (pos[0] >= size.width) offset = size.width;
      else offset = pos[0];

      setCursorOffset(offset);
      setCursorPercent(offset / size.width);
    },
    onEnter: pos => {
      setCursorOffset(pos[0]);
      setShowCursor(true);
    },
    onLeave: () => setShowCursor(false),
  });

  // 当前播放进度
  const currentTimePercent = useMemo(
    () => currentTime && (currentTime / videoDuration) * 100,
    [currentTime, videoDuration]
  );

  // 当前光标的时刻
  const cursorTime = useMemo(
    () => formatTime(cursorPercent * videoDuration),
    [cursorPercent, videoDuration]
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

  // 移动端下，拖到区域内取消拖动进度条操作
  const { events: cancelAreaEvents } = useCancelAreaContext({
    onActivatedCallback: handleGoto,
  });

  return (
    <StyledProgressContainer
      ref={progressBarRef}
      onClick={handleGoto}
      // 移动端拖动时放开触发
      {...cancelAreaEvents}
    >
      <LinearProgress
        variant="buffer"
        value={currentTimePercent}
        valueBuffer={100}
        sx={bufferRangesPercentsBarSx}
      />

      {showCursor && (
        <StyledCursorContainer sx={pointerCursorOffsetSx}>
          <StyleCursorTime>{cursorTime}</StyleCursorTime>
          <ArrowDropDownRounded />
          <ArrowDropUpRounded />
        </StyledCursorContainer>
      )}
    </StyledProgressContainer>
  );
};
