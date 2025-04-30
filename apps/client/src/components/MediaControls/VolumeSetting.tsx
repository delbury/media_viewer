import { SliderOwnProps } from '@mui/material';
import { useCallback, useMemo, useRef } from 'react';
import TooltipSetting, { TooltipSettingInstance } from '../TooltipSetting';
import { StyledSlider, StyledVolumePopoverContainer } from './style';

interface VolumeSettingProps {
  volume: number;
  onVolumeChange: (v: number) => void;
  children: React.ReactElement;
}

const VolumeSetting = ({ volume, onVolumeChange, children }: VolumeSettingProps) => {
  const tooltipSettingRef = useRef<TooltipSettingInstance>(null);
  const showVolumeText = useMemo(() => (volume * 100).toFixed(0), [volume]);

  // 在调整音量时，锁定 tooltip
  const handlePointerDown = useCallback(() => {
    tooltipSettingRef.current?.lock();
  }, []);

  const handleChange = useCallback<NonNullable<SliderOwnProps['onChange']>>(
    (ev, val) => {
      onVolumeChange(val as number);
    },
    [onVolumeChange]
  );

  return (
    <TooltipSetting
      ref={tooltipSettingRef}
      tooltipContent={
        <StyledVolumePopoverContainer>
          <span>{showVolumeText}</span>
          <StyledSlider
            size="small"
            orientation="vertical"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={handleChange}
            onPointerDown={handlePointerDown}
          />
        </StyledVolumePopoverContainer>
      }
    >
      {children}
    </TooltipSetting>
  );
};

export default VolumeSetting;
