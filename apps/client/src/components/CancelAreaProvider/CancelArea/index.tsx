import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { CancelAreaWrapper } from './style';

interface CancelAreaProps {
  activated: boolean;
  onSizeChange?: (rect: DOMRect) => void;
}

const CancelArea = ({ activated, onSizeChange }: CancelAreaProps) => {
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
  }, [onSizeChange]);

  return (
    <CancelAreaWrapper
      activated={activated}
      ref={wrapperRef}
    >
      {t('Util.MoveHereToCancel')}
    </CancelAreaWrapper>
  );
};

export default CancelArea;
