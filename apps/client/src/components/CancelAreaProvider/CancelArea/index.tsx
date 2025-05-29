import { SxProps, Theme } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { CancelAreaWrapper } from './style';

interface CancelAreaProps {
  activated: boolean;
  onSizeChange?: (rect: DOMRect | null) => void;
  sx?: SxProps<Theme>;
  text?: string;
  disabled?: boolean;
}

const CancelArea = ({ activated, onSizeChange, sx, text, disabled }: CancelAreaProps) => {
  const wrapperRef = useRef<HTMLElement>(null);
  const domRect = useRef<DOMRect>(null);
  const t = useTranslations();

  useEffect(() => {
    if (disabled) {
      onSizeChange?.(null);
      return;
    }

    const elm = wrapperRef.current;
    if (elm) {
      const rect = elm.getBoundingClientRect();
      domRect.current = rect;
      onSizeChange?.(rect);
    }
    return () => {
      onSizeChange?.(null);
    };
  }, [onSizeChange, disabled]);

  return (
    <CancelAreaWrapper
      activated={activated}
      ref={wrapperRef}
      sx={sx}
      disabled={disabled}
    >
      {text ?? t('Util.MoveHereToCancel')}
    </CancelAreaWrapper>
  );
};

export default CancelArea;
