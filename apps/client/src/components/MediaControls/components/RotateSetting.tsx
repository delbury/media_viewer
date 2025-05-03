import TooltipSetting, { TooltipSettingInstance } from '#/components/TooltipSetting';
import { OndemandVideoRounded } from '@mui/icons-material';
import { ToggleButton, ToggleButtonGroup, ToggleButtonGroupProps } from '@mui/material';
import { isNil } from 'lodash-es';
import { useCallback, useMemo, useRef } from 'react';
import { StyledToggleBtnPopoverContainer } from '../style';

interface RotateSettingProps {
  degree: number;
  onDegreeChange: (v: number) => void;
  children: React.ReactElement;
}

const ROTATE_OPTIONS = [0, 90, 180, 270];

const RotateSetting = ({ degree, onDegreeChange, children }: RotateSettingProps) => {
  const tooltipSettingRef = useRef<TooltipSettingInstance>(null);

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
      {children}
    </TooltipSetting>
  );
};

export default RotateSetting;
