import { useAnimationFrame } from '#/hooks/useAnimationFrame';
import { SxProps, Theme } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
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

  useEffect(() => {
    if (wrapperRef.current && contentRef.current) {
      // 内容超出，需要滚动
      contentWidth.current = contentRef.current.clientWidth;
      const scrollable = contentWidth.current > wrapperRef.current.clientWidth;
      setIsOversize(scrollable);
    }
  }, []);

  const { start, stop } = useAnimationFrame(diff => {
    if (contentRef.current) {
      const diffPx = PX_PER_MS * diff;
      offset.current += diffPx;
      offset.current %= contentWidth.current + TEXT_GAP;
      contentRef.current.style.transform = `translateX(${-offset.current}px)`;
    }
  });

  useEffect(() => {
    if (!disabled && isOversize) {
      // 开始
      start(2000);
    } else {
      // 停止
      stop();
    }
    return stop;
  }, [disabled, isOversize]);

  return (
    <StyledTextWrapper
      ref={wrapperRef}
      sx={sx}
    >
      <StyledTextContent ref={contentRef}>
        <span>{text}</span>
        {/* 当超出滚动时，复制一个额外的文本，用于循环滚动时展示 */}
        {isOversize && <span style={{ marginInlineStart: `${TEXT_GAP}px` }}>{text}</span>}
      </StyledTextContent>
    </StyledTextWrapper>
  );
};

export default RollingText;
