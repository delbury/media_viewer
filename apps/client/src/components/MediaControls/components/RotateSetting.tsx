import TooltipSetting, { TooltipSettingInstance } from '#/components/TooltipSetting';
import { CachedRounded, OndemandVideoRounded, RotateRightRounded } from '@mui/icons-material';
import { IconButton, ToggleButton, ToggleButtonGroup, ToggleButtonGroupProps } from '@mui/material';
import { isNil } from 'lodash-es';
import { useCallback, useMemo, useRef } from 'react';
import { StyledToggleBtnPopoverContainer } from '../style';

interface RotateSettingProps {
  degree: number;
  onDegreeChange: (v: number) => void;
  onClick: () => void;
}

const ROTATE_OPTIONS = [0, 90, 180, 270];

const RotateSetting = ({ degree, onDegreeChange, onClick }: RotateSettingProps) => {
  const tooltipSettingRef = useRef<TooltipSettingInstance>(null);

  // 是否是未旋转状态，即为 360 的整数倍
  const isNotRotated = useMemo(() => degree % 360 === 0, [degree]);

  const pureDegree = useMemo(() => {
    let val = degree % 360;
    if (val < 0) val += 360;
    return val;
  }, [degree]);

  const handleChange = useCallback<NonNullable<ToggleButtonGroupProps['onChange']>>(
    (ev, val) => {
      if (!isNil(val)) onDegreeChange(val as number);
      tooltipSettingRef.current?.close();
    },
    [onDegreeChange]
  );

  return (
    <TooltipSetting
      ref={tooltipSettingRef}
      tooltipContent={
        <StyledToggleBtnPopoverContainer>
          <ToggleButtonGroup
            size="small"
            value={pureDegree}
            onChange={handleChange}
            exclusive
          >
            {ROTATE_OPTIONS.map(it => (
              <ToggleButton
                value={it}
                key={it}
                sx={{
                  transform: `rotate(${it}deg)`,
                }}
              >
                <OndemandVideoRounded />
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </StyledToggleBtnPopoverContainer>
      }
    >
      <IconButton onClick={onClick}>
        {isNotRotated ? <RotateRightRounded /> : <CachedRounded />}
      </IconButton>
    </TooltipSetting>
  );
};

export default RotateSetting;
