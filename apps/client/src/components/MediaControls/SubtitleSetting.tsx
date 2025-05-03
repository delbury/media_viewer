import { FileInfo } from '#pkgs/apis';
import { ToggleButton, ToggleButtonGroup, ToggleButtonGroupProps } from '@mui/material';
import { useCallback, useRef } from 'react';
import TooltipSetting, { TooltipSettingInstance } from '../TooltipSetting';
import { StyledRateChildrenWrapper, StyledToggleBtnPopoverContainer } from './style';

export type Subtitle = NonNullable<FileInfo['subtitles']>[0];

interface SubtitleSettingProps {
  subtitleOptions?: Subtitle[];
  subtitle?: Subtitle;
  onSubtitleChange: (v: Subtitle) => void;
  children: React.ReactElement;
}

const SubtitleSetting = ({
  subtitle,
  onSubtitleChange,
  subtitleOptions,
  children,
}: SubtitleSettingProps) => {
  const tooltipSettingRef = useRef<TooltipSettingInstance>(null);

  const handleChange = useCallback<NonNullable<ToggleButtonGroupProps['onChange']>>(
    (ev, val) => {
      if (val) onSubtitleChange(val as Subtitle);
      tooltipSettingRef.current?.close();
    },
    [onSubtitleChange]
  );

  return (
    <TooltipSetting
      ref={tooltipSettingRef}
      tooltipContent={
        <StyledToggleBtnPopoverContainer>
          <ToggleButtonGroup
            size="small"
            value={subtitle}
            onChange={handleChange}
            exclusive
          >
            {subtitleOptions?.map(it => (
              <ToggleButton
                value={it}
                key={it.path}
              >
                {it.lang}/{it.ext}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </StyledToggleBtnPopoverContainer>
      }
    >
      <StyledRateChildrenWrapper>{children}</StyledRateChildrenWrapper>
    </TooltipSetting>
  );
};

export default SubtitleSetting;
