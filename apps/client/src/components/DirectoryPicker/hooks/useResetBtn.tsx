import { useElementAnimation } from '#/hooks/useElementAnimation';
import { RefreshRounded } from '@mui/icons-material';
import { useMemo } from 'react';
import { StyledFileResetBtn } from '../style/use-reset-btn';

export const useResetBtn = (onClick: () => void) => {
  const reset = useElementAnimation<HTMLButtonElement>();

  const ResetBtn = useMemo(() => {
    return (
      <StyledFileResetBtn
        ref={reset.domRef}
        onClick={() => {
          onClick();
          reset.startByPreset('rotate360');
        }}
      >
        <RefreshRounded />
      </StyledFileResetBtn>
    );
  }, [onClick, reset]);

  return {
    ResetBtn,
    ...reset,
  };
};
