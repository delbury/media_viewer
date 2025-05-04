import { VolumeOffRounded, VolumeUpRounded } from '@mui/icons-material';
import { IconButton, SliderOwnProps } from '@mui/material';
import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import TooltipSetting, { TooltipSettingInstance } from '../../TooltipSetting';
import { StyledSlider, StyledVolumePopoverContainer } from '../style';
import { bindEvent } from '../util';

interface VolumeSettingProps {
  mediaRef: RefObject<HTMLMediaElement | null>;
}

const VolumeSetting = ({ mediaRef }: VolumeSettingProps) => {
  const tooltipSettingRef = useRef<TooltipSettingInstance>(null);
  const [volume, setVolume] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const displayVolumeText = useMemo(() => (volume * 100).toFixed(0), [volume]);

  // 在调整音量时，锁定 tooltip
  const handlePointerDown = useCallback(() => {
    tooltipSettingRef.current?.lock();
  }, []);

  // 音量改变
  const handleChange = useCallback<NonNullable<SliderOwnProps['onChange']>>(
    (ev, val) => {
      if (mediaRef.current) mediaRef.current.volume = val as number;
    },
    [mediaRef]
  );

  // 静音切换
  const handleToggleMute = useCallback(() => {
    if (!mediaRef.current) return;
    mediaRef.current.muted = !mediaRef.current.muted;
  }, [mediaRef]);

  useEffect(() => {
    const elm = mediaRef.current;
    if (!elm) return;
    setIsMuted(elm.muted);
    setVolume(elm.volume);

    // 音量改变事件
    const volumechangeController = bindEvent(elm, 'volumechange', () => {
      setIsMuted(elm.muted || !elm.volume);
      setVolume(elm.volume);
    });

    return () => {
      volumechangeController.abort();
    };
  }, [mediaRef]);

  return (
    <TooltipSetting
      ref={tooltipSettingRef}
      tooltipContent={
        <StyledVolumePopoverContainer>
          <span>{displayVolumeText}</span>
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
      <IconButton onClick={handleToggleMute}>
        {isMuted ? <VolumeOffRounded /> : <VolumeUpRounded />}
      </IconButton>
    </TooltipSetting>
  );
};

export default VolumeSetting;
