import { Tooltip } from '@mui/material';
import { useMemo, useRef } from 'react';
import { StyledSlider, StyledVolumePopoverContainer, StyledVolumeTooltipWrapper } from './style';

interface VolumeSettingProps {
  volume: number;
  onVolumeChange: (v: number) => void;
  children: React.ReactElement;
}

const VolumeSetting = ({ volume, onVolumeChange, children }: VolumeSettingProps) => {
  const wrapperRef = useRef<HTMLElement>(null);
  const showVolumeText = useMemo(() => (volume * 100).toFixed(0), [volume]);

  return (
    <StyledVolumeTooltipWrapper ref={wrapperRef}>
      <Tooltip
        placement="top"
        leaveDelay={200}
        title={
          <StyledVolumePopoverContainer>
            <span>{showVolumeText}</span>
            <StyledSlider
              size="small"
              orientation="vertical"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(_, val) => onVolumeChange(val as number)}
            />
          </StyledVolumePopoverContainer>
        }
        slotProps={{
          popper: {
            container: wrapperRef.current,
          },
        }}
      >
        {children}
      </Tooltip>
    </StyledVolumeTooltipWrapper>
  );
};

export default VolumeSetting;
