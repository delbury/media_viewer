import { calcTimeRanges } from '#/components/VideoViewer/util';
import { useCancelAreaContext } from '#/hooks/useCancelAreaContext';
import { useMove } from '#/hooks/useMove';
import { formatTime } from '#/utils';
import { ArrowDropDownRounded, ArrowDropUpRounded } from '@mui/icons-material';
import { LinearProgress, linearProgressClasses, SxProps, Theme } from '@mui/material';
import { isNil } from 'lodash-es';
import {
  MouseEventHandler,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  NEAR_EDGE_MIN_DISTANCE,
  NearType,
  StyleCursorTime,
  StyledCursorContainer,
  StyledProgressContainer,
} from '../style';
import { bindEvent, bindEventOnce } from '../util';

const BUFFER_BAR_COLOR = 'var(--mui-palette-grey-600)';
const BUFFER_BAR_COLOR_EMPTY = 'transparent';

export const CANCEL_AREA_SX: SxProps<Theme> = {
  marginBottom: '144px',
};

interface MediaProgressProps {
  mediaRef: RefObject<HTMLMediaElement | null>;
  currentTime: number;
  videoDuration: number;
  // 可能要跳转到的时刻预览
  previewDiffTime?: number;
  onGoTo?: () => void;
}

// 在移动端拖拽进度条结束时
// 可以触发当前播放进度改变的垂直方向的位置距离元素的相对距离阈值
// const MOBILE_DRAG_END_TRIGGER_THRESHOLD = 80;

export const MediaProgress = ({
  mediaRef,
  currentTime,
  videoDuration,
  previewDiffTime,
  onGoTo,
}: MediaProgressProps) => {
  const progressBarRef = useRef<HTMLElement>(null);
  const [cursorOffset, setCursorOffset] = useState(0);
  const [bufferRanges, setBufferRanges] = useState<[number, number][]>([]);

  const [showCursor, setShowCursor] = useState(false);
  const [showCursorForce, setShowCursorForce] = useState(false);
  const realShowCursor = showCursorForce || showCursor || !isNil(previewDiffTime);

  // const [currentTime, addCurrentTimeInstant] = useOptimistic<number, number>(
  //   rawCurrentTime,
  //   (_, instantVal) => {
  //     return instantVal;
  //   }
  // );

  // 禁用跳转拖动
  const progressDisabled = useMemo(
    () => !Number.isFinite(videoDuration) || Number.isNaN(videoDuration),
    [videoDuration]
  );

  useMove({
    domRef: progressBarRef,
    onMove: (pos, size) => {
      let offset = 0;
      if (pos[0] <= 0) offset = 0;
      else if (pos[0] >= size.width) offset = size.width;
      else offset = pos[0];

      setCursorOffset(offset);
    },
    onEnter: pos => {
      setCursorOffset(pos[0]);
      setShowCursor(true);
    },
    onLeave: () => setShowCursor(false),
  });

  // 当前播放进度百分比，0 ~ 100
  const currentTimePercent = useMemo(
    () => currentTime && (currentTime / videoDuration) * 100,
    [currentTime, videoDuration]
  );

  // 当前光标的时刻文本
  const cursorTimeText = useMemo(() => {
    if (!progressBarRef.current) return '';
    let time = isNil(previewDiffTime)
      ? (cursorOffset / progressBarRef.current.offsetWidth) * videoDuration
      : currentTime + previewDiffTime;
    // 边界限制
    if (time < 0) time = 0;
    else if (time > videoDuration) time = videoDuration;

    return formatTime(time);
  }, [currentTime, cursorOffset, previewDiffTime, videoDuration]);

  // 鼠标移动的位置，或者相对跳转会到达的位置，定位游标的位置
  const { pointerCursorOffsetSx, near } = useMemo(() => {
    const elm = progressBarRef.current;
    let offset = cursorOffset;
    const offsetWidth = elm?.offsetWidth ?? 0;
    if (offsetWidth && !isNil(previewDiffTime)) {
      offset = (currentTimePercent / 100 + previewDiffTime / videoDuration) * offsetWidth;
    }

    // 边界限制
    if (offset < 0) offset = 0;
    else if (offsetWidth && offset > offsetWidth) offset = offsetWidth;

    const near: NearType =
      offset <= NEAR_EDGE_MIN_DISTANCE
        ? 'left'
        : offset >= offsetWidth - NEAR_EDGE_MIN_DISTANCE
          ? 'right'
          : null;
    return {
      near,
      pointerCursorOffsetSx: {
        transform: `translate(${offset}px)`,
      } satisfies SxProps,
    };
  }, [currentTimePercent, cursorOffset, previewDiffTime, videoDuration]);

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
  const handleGoTo = useCallback(
    async (ev: PointerEvent | MouseEvent) => {
      if (!mediaRef.current || progressDisabled) return;
      const { offsetX } = ev;
      const { offsetWidth } = ev.target as HTMLElement;
      const time = (offsetX / offsetWidth) * videoDuration;
      mediaRef.current.currentTime = time;
      onGoTo?.();

      setShowCursorForce(true);
      bindEventOnce(mediaRef.current, 'timeupdate', () => setShowCursorForce(false));
      // startTransition(async () => {
      //   addCurrentTimeInstant(time);
      //   await new Promise(resolve => {
      //     if (!mediaRef.current) return resolve(void 0);
      //     bindEventOnce(mediaRef.current, 'timeupdate', resolve);
      //   });
      // });
    },
    [mediaRef, progressDisabled, videoDuration, onGoTo]
  );
  const handleClick = useCallback<MouseEventHandler>(
    ev => {
      handleGoTo(ev.nativeEvent);
    },
    [handleGoTo]
  );

  // 移动端下，拖到区域内取消拖动进度条操作
  useCancelAreaContext({
    domRef: progressBarRef,
    onActivatedCallback: handleGoTo,
    areaSx: CANCEL_AREA_SX,
  });

  useEffect(() => {
    const elm = mediaRef.current;
    if (!elm) return;
    // 加载事件
    const progressController = bindEvent(elm, 'progress', () => {
      const ranges = calcTimeRanges(elm.buffered);
      setBufferRanges(ranges);
    });

    // 加载第一帧完成
    bindEventOnce(elm, 'loadeddata', () => {
      const ranges = calcTimeRanges(elm.buffered);
      setBufferRanges(ranges);
    });

    return () => {
      progressController.abort();
    };
  }, [mediaRef]);

  return (
    <StyledProgressContainer
      ref={progressBarRef}
      onClick={handleClick}
      sx={{
        cursor: progressDisabled ? 'not-allowed' : void 0,
      }}
    >
      <LinearProgress
        variant="buffer"
        value={currentTimePercent}
        valueBuffer={100}
        sx={bufferRangesPercentsBarSx}
      />

      {realShowCursor && (
        <StyledCursorContainer sx={pointerCursorOffsetSx}>
          <StyleCursorTime near={near}>{cursorTimeText}</StyleCursorTime>
          <ArrowDropDownRounded />
          <ArrowDropUpRounded />
        </StyledCursorContainer>
      )}
    </StyledProgressContainer>
  );
};
