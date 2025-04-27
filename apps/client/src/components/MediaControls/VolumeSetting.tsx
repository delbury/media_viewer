import { stopPropagation } from '#/utils';
import { SliderOwnProps, Tooltip } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyledSlider, StyledVolumePopoverContainer, StyledVolumeTooltipWrapper } from './style';

interface VolumeSettingProps {
  volume: number;
  onVolumeChange: (v: number) => void;
  children: React.ReactElement;
}

const VolumeSetting = ({ volume, onVolumeChange, children }: VolumeSettingProps) => {
  const wrapperRef = useRef<HTMLElement>(null);
  const showVolumeText = useMemo(() => (volume * 100).toFixed(0), [volume]);
  // tooltip 是否打开
  const [open, setOpen] = useState(false);
  // 锁定tooltip 打开的状态
  const lockOpen = useRef(false);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => {
    if (!lockOpen) setOpen(false);
  }, [lockOpen]);

  // 在调整音量时，锁定 tooltip
  const handlePointerDown = useCallback(() => {
    lockOpen.current = true;
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    document.addEventListener(
      'pointerup',
      () => {
        if (lockOpen.current) setOpen(false);
        lockOpen.current = false;
      },
      { signal: controller.signal }
    );
    return () => {
      controller.abort();
    };
  }, []);

  const handleChange = useCallback<NonNullable<SliderOwnProps['onChange']>>(
    (ev, val) => {
      stopPropagation(ev);
      onVolumeChange(val as number);
    },
    [onVolumeChange]
  );

  return (
    <StyledVolumeTooltipWrapper ref={wrapperRef}>
      <Tooltip
        placement="top"
        leaveDelay={200}
        disableFocusListener
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
              onChange={handleChange}
              onPointerDown={handlePointerDown}
            />
          </StyledVolumePopoverContainer>
        }
        slotProps={{
          popper: {
            container: wrapperRef.current,
          },
        }}
        open={open}
        onOpen={handleOpen}
        onClose={handleClose}
      >
        {children}
      </Tooltip>
    </StyledVolumeTooltipWrapper>
  );
};

export default VolumeSetting;
