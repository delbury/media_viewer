import { usePersistentConfig } from '@/hooks/usePersistentConfig';
import { BoxProps, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import Empty from '../Empty';
import ScrollBox, { ScrollBoxProps } from '../ScrollBox';
import { RESIZE_BAR_SIZE } from './constant';
import ResizeBar, { ResizeBarProps } from './ResizeBar';
import { StyledContainerItem } from './style';

interface ResizeContainerProps {
  children?: React.ReactNode;
  height?: string;
  title?: string;
  emptyText?: string;
  isEmpty?: boolean;
  resizePosition?: ResizeBarProps['position'];
  sx?: BoxProps['sx'];
  // 保存拖动 size 本地配置的 key
  persistentKey?: string;
  scrollBoxProps?: ScrollBoxProps;
}

const ResizeContainer = ({
  children,
  height,
  title,
  isEmpty,
  emptyText,
  resizePosition,
  sx,
  persistentKey,
  scrollBoxProps,
}: ResizeContainerProps) => {
  const t = useTranslations();
  const resizable = !!resizePosition;
  const resizableStyle = useMemo<BoxProps['sx']>(() => {
    if (!resizePosition) return { ...sx };
    const padding = RESIZE_BAR_SIZE + 8;
    return {
      ...sx,
      position: 'relative',
      paddingTop: resizePosition === 'top' ? padding + 'px' : void 0,
      paddingBottom: resizePosition === 'bottom' ? padding + 'px' : void 0,
    };
  }, [resizePosition, sx]);
  const [sizeOffset, setSizeOffset] = usePersistentConfig<[number, number]>([0, 0], persistentKey);

  const currentHeight = useMemo(() => {
    if (height) {
      const symbol = resizePosition === 'top' ? '-' : '+';
      return `calc(${height} ${symbol} ${sizeOffset[1]}px)`;
    }
  }, [height, sizeOffset, resizePosition]);

  return (
    <StyledContainerItem
      sx={{
        height: currentHeight,
        flex: height ? void 0 : 1,
        ...resizableStyle,
      }}
    >
      {!!title && <Typography sx={{ color: 'text.secondary', marginBottom: '4px' }}>{title}</Typography>}
      <ScrollBox
        {...scrollBoxProps}
        sx={{ flex: 1 }}
      >
        {isEmpty ? <Empty label={emptyText ?? t('Common.Empty')} /> : children}
      </ScrollBox>

      {resizable && (
        <ResizeBar
          defaultOffset={sizeOffset}
          position={resizePosition}
          onSizeChange={(pos, offset) => {
            if (pos === 'bottom' || pos === 'top') {
              setSizeOffset([0, offset[1]]);
            }
          }}
        />
      )}
    </StyledContainerItem>
  );
};

export default ResizeContainer;
