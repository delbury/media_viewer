'use client';

import { useDrag, UseDragParams } from '#/hooks/useDrag';
import { MoreHorizOutlined } from '@mui/icons-material';
import { BoxProps } from '@mui/material';
import { useMemo, useRef } from 'react';
import { RESIZE_BAR_SIZE } from './constant';
import { StyledBarWrapper } from './style';

export type ResizeBarProps = {
  position: 'top' | 'bottom';
  onSizeChange: (pos: ResizeBarProps['position'], offset: [number, number]) => void;
} & Pick<UseDragParams, 'onStart' | 'onEnd' | 'defaultOffset'>;

const ResizeBar = ({ position, onSizeChange, defaultOffset, onStart, onEnd }: ResizeBarProps) => {
  const barRef = useRef<HTMLElement>(null);
  const barPositionY = useRef<number[]>([]);
  const { dragEventHandler } = useDrag({
    onStart,
    onEnd,
    defaultOffset,
    watchAxis: 'y',
    callback: offset => {
      onSizeChange(position, offset);

      if (barRef.current) {
        const rect = barRef.current.getBoundingClientRect();
        barPositionY.current.unshift(rect.y);
        barPositionY.current.length = 2;

        //当前的偏移量和上一次的偏移量相同，到边界了，不再触发
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
    <StyledBarWrapper
      ref={barRef}
      sx={{ ...barStyle }}
      onPointerDown={dragEventHandler}
    >
      <MoreHorizOutlined fontSize="small" />
    </StyledBarWrapper>
  );
};

export default ResizeBar;
