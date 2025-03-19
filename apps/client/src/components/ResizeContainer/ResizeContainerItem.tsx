import { Box, BoxProps, Typography } from '@mui/material';
import { ScrollBox } from './style';
import Empty from '../Empty';
import { useTranslations } from 'next-intl';
import ResizeBar, { RESIZE_BAR_SIZE, ResizeBarProps } from './ResizeBar';
import { useMemo } from 'react';

interface ResizeContainerProps {
  children?: React.ReactNode;
  height?: string;
  title?: string;
  emptyText?: string;
  isEmpty?: boolean;
  resizePosition?: ResizeBarProps['position'];
  sx?: BoxProps['sx'];
}

const BAR_PADDING = RESIZE_BAR_SIZE + 8;

const ResizeContainer = ({ children, height, title, isEmpty, emptyText, resizePosition, sx }: ResizeContainerProps) => {
  const t = useTranslations();
  const resizable = !!resizePosition;
  const resizableStyle = useMemo<BoxProps['sx']>(() => {
    if (!resizePosition) return { ...sx };
    return {
      ...sx,
      position: 'relative',
      paddingTop: resizePosition === 'top' ? BAR_PADDING + 'px' : void 0,
      paddingBottom: resizePosition === 'bottom' ? BAR_PADDING + 'px' : void 0,
    };
  }, [resizePosition, sx]);

  return (
    <Box
      sx={{
        flex: height ? void 0 : 1,
        overflow: 'auto',
        ...resizableStyle,
      }}
    >
      {!!title && (
        <Typography sx={{ textAlign: 'left', color: 'text.secondary', marginBottom: '4px' }}>{title}</Typography>
      )}
      <ScrollBox height={height}>{isEmpty ? <Empty label={emptyText ?? t('Common.Empty')} /> : children}</ScrollBox>

      {resizable && <ResizeBar position={resizePosition} />}
    </Box>
  );
};

export default ResizeContainer;
