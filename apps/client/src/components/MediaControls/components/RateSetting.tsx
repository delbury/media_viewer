import { RectangleRounded } from '@mui/icons-material';
import { IconButton, ToggleButtonGroup, ToggleButtonGroupProps } from '@mui/material';
import { at, isNil } from 'lodash-es';
import { RefObject, useCallback, useMemo, useRef } from 'react';
import TooltipSetting, { TooltipSettingInstance } from '../../TooltipSetting';
import {
  StyledChildrenWrapper,
  StyledRateOption,
  StyledRateText,
  StyledToggleBtnPopoverContainer,
} from '../style';

interface RateSettingProps {
  mediaRef: RefObject<HTMLMediaElement | null>;
  rate: number;
  onRateChange: (v: number) => void;
}

const FULL_RATE_OPTIONS = [0.5, 1, 1.5, 2];
export const SWITCH_RATE_OPTIONS = at(FULL_RATE_OPTIONS, [1, 2]);
// 最大播放速度
export const MAX_RATE = FULL_RATE_OPTIONS[FULL_RATE_OPTIONS.length - 1];

const RATE_SUFFIX_SYMBOL = 'x';

const formatRate = (rate: number) => `${rate.toFixed(1)}${RATE_SUFFIX_SYMBOL}`;

const RateSetting = ({ rate, onRateChange, mediaRef }: RateSettingProps) => {
  const tooltipSettingRef = useRef<TooltipSettingInstance>(null);
  const displayRateText = useMemo(() => formatRate(rate), [rate]);

  const handleChange = useCallback<NonNullable<ToggleButtonGroupProps['onChange']>>(
    (ev, val) => {
      if (!isNil(val)) onRateChange(val as number);
      tooltipSettingRef.current?.close();
    },
    [onRateChange]
  );

  // 切换速率
  const handleSwitchRate = useCallback(() => {
    if (!mediaRef.current) return;
    const rate = mediaRef.current.playbackRate;
    const index = SWITCH_RATE_OPTIONS.findIndex(v => v === rate);
    let newRate = 1;
    if (index > -1) newRate = SWITCH_RATE_OPTIONS[(index + 1) % SWITCH_RATE_OPTIONS.length];
    mediaRef.current.playbackRate = newRate;
  }, [mediaRef]);

  return (
    <TooltipSetting
      ref={tooltipSettingRef}
      tooltipContent={
        <StyledToggleBtnPopoverContainer>
          <ToggleButtonGroup
            size="small"
            value={rate}
            onChange={handleChange}
            exclusive
          >
            {FULL_RATE_OPTIONS.map(it => (
              <StyledRateOption
                value={it}
                key={it}
              >
                {formatRate(it)}
              </StyledRateOption>
            ))}
          </ToggleButtonGroup>
        </StyledToggleBtnPopoverContainer>
      }
    >
      <StyledChildrenWrapper>
        <IconButton onClick={handleSwitchRate}>
          <RectangleRounded />
        </IconButton>
        <StyledRateText>{displayRateText}</StyledRateText>
      </StyledChildrenWrapper>
    </TooltipSetting>
  );
};

export default RateSetting;
