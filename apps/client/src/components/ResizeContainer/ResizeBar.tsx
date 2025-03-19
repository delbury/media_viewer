import { Box, BoxProps } from '@mui/material';
import { useMemo } from 'react';
import { BarWrapper } from './style';
import { MoreHorizOutlined } from '@mui/icons-material';

export interface ResizeBarProps {
  position: 'top' | 'bottom';
}

export const RESIZE_BAR_SIZE = 16;

const ResizeBar = ({ position }: ResizeBarProps) => {
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
    <BarWrapper sx={{ ...barStyle }}>
      <MoreHorizOutlined />
    </BarWrapper>
  );
};

export default ResizeBar;
