import { SxProps, Theme } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { CancelAreaWrapper } from './style';

interface CancelAreaProps {
  activated: boolean;
  onSizeChange?: (rect: DOMRect) => void;
  sx?: SxProps<Theme>;
}

const CancelArea = ({ activated, onSizeChange, sx }: CancelAreaProps) => {
  const wrapperRef = useRef<HTMLElement>(null);
  const domRect = useRef<DOMRect>(null);
  const t = useTranslations();

  useEffect(() => {
    const elm = wrapperRef.current;
    if (elm) {
      const rect = elm.getBoundingClientRect();
      domRect.current = rect;
      onSizeChange?.(rect);
    }
  }, [onSizeChange, sx]);

  return (
    <CancelAreaWrapper
      activated={activated}
      ref={wrapperRef}
      sx={sx}
    >
      {t('Util.MoveHereToCancel')}
    </CancelAreaWrapper>
  );
};

export default CancelArea;
