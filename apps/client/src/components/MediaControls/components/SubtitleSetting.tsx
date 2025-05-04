import { FileInfo } from '#pkgs/apis';
import { SubtitlesOffRounded, SubtitlesRounded } from '@mui/icons-material';
import { IconButton, ToggleButton, ToggleButtonGroup, ToggleButtonGroupProps } from '@mui/material';
import { useCallback, useMemo, useRef } from 'react';
import TooltipSetting, { TooltipSettingInstance } from '../../TooltipSetting';
import { StyledRateChildrenWrapper, StyledToggleBtnPopoverContainer } from '../style';

export type Subtitle = NonNullable<FileInfo['subtitles']>[0];

interface SubtitleSettingProps {
  subtitleOptions?: Subtitle[];
  subtitle?: Subtitle;
  onSubtitleChange: (v: Subtitle) => void;
  onClick: () => void;
}

const SubtitleSetting = ({
  subtitle,
  onSubtitleChange,
  subtitleOptions,
  onClick,
}: SubtitleSettingProps) => {
  const tooltipSettingRef = useRef<TooltipSettingInstance>(null);

  const hasSubtitle = useMemo(() => !!subtitleOptions?.length, [subtitleOptions?.length]);

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
      <StyledRateChildrenWrapper>
        <IconButton
          disabled={!hasSubtitle}
          onClick={onClick}
        >
          {hasSubtitle && !!subtitle ? <SubtitlesRounded /> : <SubtitlesOffRounded />}
        </IconButton>
      </StyledRateChildrenWrapper>
    </TooltipSetting>
  );
};

export default SubtitleSetting;
