import { useDrag } from '@/hooks/useDrag';
import { MoreHorizOutlined } from '@mui/icons-material';
import { BoxProps } from '@mui/material';
import { useMemo, useRef } from 'react';
import { BarWrapper } from './style';

export interface ResizeBarProps {
  position: 'top' | 'bottom';
  onSizeChange: (pos: ResizeBarProps['position'], offset: [number, number]) => void;
  // 默认初始偏移
  defaultOffset?: [number, number];
}

export const RESIZE_BAR_SIZE = 16;

const ResizeBar = ({ position, onSizeChange, defaultOffset }: ResizeBarProps) => {
  const barRef = useRef<HTMLElement>(null);
  const barPositionY = useRef<number[]>([]);
  const { events } = useDrag({
    defaultOffset,
    watchAxis: 'y',
    callback: offset => {
      onSizeChange(position, offset);

      if (barRef.current) {
        const rect = barRef.current.getBoundingClientRect();
        barPositionY.current.unshift(rect.y);
        barPositionY.current.length = 2;

        // 到边界了，不再触发
        if (barPositionY.current[0] === barPositionY.current[1]) return false;
      }
    },
  });

  const barStyle = useMemo(() => {
    const style: BoxProps['sx'] = {
      height: RESIZE_BAR_SIZE + 'px',
    };
    if (position === 'top') {
      style.top = 0;
    } else if (position === 'bottom') {
      style.bottom = 0;
    }
    return style;
  }, [position]);

  return (
    <BarWrapper
      ref={barRef}
      sx={{ ...barStyle }}
      {...events}
    >
      <MoreHorizOutlined fontSize="small" />
    </BarWrapper>
  );
};

export default ResizeBar;
