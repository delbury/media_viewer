import { FileInfo } from '#pkgs/apis';
import { SubtitlesOffRounded, SubtitlesRounded } from '@mui/icons-material';
import { IconButton, ToggleButton, ToggleButtonGroup, ToggleButtonGroupProps } from '@mui/material';
import { useCallback, useMemo, useRef, useState } from 'react';
import TooltipSetting, { TooltipSettingInstance } from '../../TooltipSetting';
import { StyledChildrenWrapper, StyledToggleBtnPopoverContainer } from '../style';

export type Subtitle = NonNullable<FileInfo['subtitles']>[0];

interface SubtitleSettingProps {
  subtitleOptions?: Subtitle[];
}

const SubtitleSetting = ({ subtitleOptions }: SubtitleSettingProps) => {
  const tooltipSettingRef = useRef<TooltipSettingInstance>(null);
  // 当前字幕
  const [subtitle, setSubtitle] = useState<Subtitle | undefined>(subtitleOptions?.[0]);

  const hasSubtitle = useMemo(() => !!subtitleOptions?.length, [subtitleOptions?.length]);

  const handleChange = useCallback<NonNullable<ToggleButtonGroupProps['onChange']>>((ev, val) => {
    if (val) setSubtitle(val as Subtitle);
    tooltipSettingRef.current?.close();
  }, []);

  // 之前的字幕
  const lastSubtitle = useRef<Subtitle>(void 0);
  // 启用、禁用字幕
  const handleToggleSubtitle = useCallback(() => {
    if (subtitle) {
      lastSubtitle.current = subtitle;
      setSubtitle(void 0);
    } else {
      setSubtitle(lastSubtitle.current);
      lastSubtitle.current = void 0;
    }
  }, [subtitle]);

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
      <StyledChildrenWrapper>
        <IconButton
          disabled={!hasSubtitle}
          onClick={handleToggleSubtitle}
        >
          {hasSubtitle && !!subtitle ? <SubtitlesRounded /> : <SubtitlesOffRounded />}
        </IconButton>
      </StyledChildrenWrapper>
    </TooltipSetting>
  );
};

export default SubtitleSetting;
