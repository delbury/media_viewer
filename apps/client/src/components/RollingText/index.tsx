import { useAnimationFrame } from '#/hooks/useAnimationFrame';
import { SxProps, Theme } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyledTextContent, StyledTextWrapper } from './style';

// 每毫秒滚动的像素
const PX_PER_MS = 80 / 1000;

// 两条文本的间距
const TEXT_GAP = 48;

interface RollingTextProps {
  disabled?: boolean;
  sx?: SxProps<Theme>;
  text?: string;
}

const RollingText = ({ sx, text, disabled }: RollingTextProps) => {
  const [isOversize, setIsOversize] = useState(false);
  const wrapperRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLElement>(null);
  const contentWidth = useRef(0);
  const offset = useRef(0);

  // 刷新帧回调
  const handleCallback = useCallback((diff: number) => {
    if (!contentRef.current) return;
    const diffPx = PX_PER_MS * diff;
    offset.current += diffPx;
    offset.current %= contentWidth.current + TEXT_GAP;
    contentRef.current.style.setProperty('transform', `translateX(${-offset.current}px)`);
  }, []);

  // 结束动画后清理现场
  const handleStop = useCallback(() => {
    if (!contentRef.current) return;
    offset.current = 0;
    contentRef.current.style.removeProperty('transform');
  }, []);

  const { start, stop } = useAnimationFrame(handleCallback, { onStop: handleStop });

  useEffect(() => {
    if (!wrapperRef.current || !contentRef.current) return;

    stop();
    // 内容超出，需要滚动
    contentWidth.current = contentRef.current.clientWidth;
    // 如何此时已经是滚动状态，需要去掉额外复制的文本的宽度
    if (isOversize) contentWidth.current = (contentWidth.current - TEXT_GAP) / 2;
    const scrollable = contentWidth.current > wrapperRef.current.clientWidth;
    setIsOversize(scrollable);

    if (!disabled && scrollable) {
      // 开始
      start(2000);
    } else {
      // 停止
      stop();
    }
    return stop;
  }, [disabled, text]);

  return (
    <StyledTextWrapper ref={wrapperRef}>
      <StyledTextContent
        ref={contentRef}
        sx={sx}
      >
        <span>{text}</span>
        {/* 当超出滚动时，复制一个额外的文本，用于循环滚动时展示 */}
        {isOversize && <span style={{ marginInlineStart: `${TEXT_GAP}px` }}>{text}</span>}
      </StyledTextContent>
    </StyledTextWrapper>
  );
};

export default RollingText;
