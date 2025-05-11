import { FlashAutoRounded, FlashOffRounded, FlashOnRounded } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useCallback } from 'react';

interface SourceSettingProps {
  isAuto?: boolean;
  useSource?: boolean;
  onUseSourceChange?: (v: boolean) => void;
}

const SourceSetting = ({ isAuto, useSource, onUseSourceChange }: SourceSettingProps) => {
  const handleChange = useCallback(() => {
    onUseSourceChange?.(!useSource);
  }, [onUseSourceChange, useSource]);

  return (
    <IconButton
      disabled={isAuto}
      onClick={handleChange}
    >
      {isAuto ? <FlashAutoRounded /> : useSource ? <FlashOnRounded /> : <FlashOffRounded />}
    </IconButton>
  );
};

export default SourceSetting;
