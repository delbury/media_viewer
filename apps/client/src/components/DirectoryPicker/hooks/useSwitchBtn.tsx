import { usePersistentConfig } from '@/hooks/usePersistentConfig';
import { UnfoldMoreOutlined } from '@mui/icons-material';
import { useMemo } from 'react';
import { StyledSwitchBtn, StyledSwitchBtnWrapper } from '../style';

export const useSwitchWrapBtn = (defaultIsWrap: boolean, persistentKey?: string) => {
  const [isWrap, setIsWrap] = usePersistentConfig(defaultIsWrap, persistentKey);

  const Btn = useMemo(() => {
    return (
      <StyledSwitchBtnWrapper>
        <StyledSwitchBtn
          size="small"
          onClick={() => {
            setIsWrap(!isWrap);
          }}
          isWrap={isWrap}
        >
          <UnfoldMoreOutlined />
        </StyledSwitchBtn>
      </StyledSwitchBtnWrapper>
    );
  }, [isWrap, setIsWrap]);

  return { Btn, isWrap, setIsWrap };
};
