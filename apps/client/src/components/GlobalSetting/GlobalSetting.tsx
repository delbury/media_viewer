'use client';

import { usePersistentConfig } from '#/hooks/usePersistentConfig';
import { Switch } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import Dialog from '../Dialog';
import ToolGroupBtn from '../ToolGroupBtn';
import {
  DIR_PATH_REVERSE_KEY,
  DURATION_ROUND_TO_OPTIONS,
  FILE_SIZE_ROUND_TO_KEY,
  RANDOM_PLAY_STRATEGIES,
  RANDOM_PLAY_STRATEGY_KEY,
  RandomPlayStrategy,
  VIDEO_DURATION_ROUND_TO_KEY,
} from './config';
import {
  StyledSettingContainer,
  StyledSettingGroupTitle,
  StyledSettingItem,
  StyledSettingLabel,
} from './style';

interface GlobalSettingProps {
  visible: boolean;
  onClose: () => void;
}

const GlobalSetting = ({ visible, onClose }: GlobalSettingProps) => {
  const t = useTranslations();

  const [dirPathReverse, setDirPathReverse] = usePersistentConfig<boolean>(
    false,
    DIR_PATH_REVERSE_KEY
  );

  const [videoDurationRoundTo, setVideoDurationRoundTo] = usePersistentConfig<number | null>(
    null,
    VIDEO_DURATION_ROUND_TO_KEY
  );

  const [fileSizeRoundTo, setFileSizeRoundTo] = usePersistentConfig<number | null>(
    null,
    FILE_SIZE_ROUND_TO_KEY
  );

  const [randomPlayStrategy, setRandomPlayStrategy] = usePersistentConfig<RandomPlayStrategy>(
    RandomPlayStrategy.Default,
    RANDOM_PLAY_STRATEGY_KEY
  );

  const handleOk = useCallback(() => {}, []);

  return (
    <Dialog
      open={visible}
      onClose={onClose}
      onOk={handleOk}
      title={t('Setting.GlobalSetting')}
      onlyClose
      dialogProps={{
        maxWidth: 'md',
      }}
    >
      <StyledSettingContainer>
        <StyledSettingGroupTitle>{t('Setting.General')}</StyledSettingGroupTitle>
        <StyledSettingItem>
          <StyledSettingLabel>{t('Setting.DirectoryOrderReverse')}</StyledSettingLabel>
          <Switch
            size="small"
            checked={dirPathReverse}
            onChange={(_, val) => setDirPathReverse(val)}
          />
        </StyledSettingItem>

        <StyledSettingGroupTitle>{t('Tools.RepeatFileAnalyzer')}</StyledSettingGroupTitle>
        <StyledSettingItem>
          <StyledSettingLabel>{t('Setting.VideoDurationRoundTo')}</StyledSettingLabel>
          <ToolGroupBtn
            exclusive
            rawLabel
            size="medium"
            value={videoDurationRoundTo}
            onChange={(_, value) => setVideoDurationRoundTo(value)}
            items={DURATION_ROUND_TO_OPTIONS}
          />
        </StyledSettingItem>
        <StyledSettingItem>
          <StyledSettingLabel>{t('Setting.FileSizeRoundTo')}</StyledSettingLabel>
          <ToolGroupBtn
            exclusive
            rawLabel
            size="medium"
            value={fileSizeRoundTo}
            onChange={(_, value) => setFileSizeRoundTo(value)}
            items={DURATION_ROUND_TO_OPTIONS}
          />
        </StyledSettingItem>

        <StyledSettingGroupTitle>{t('Common.Video')}</StyledSettingGroupTitle>
        <StyledSettingItem>
          <StyledSettingLabel>{t('Setting.RandomPlayStrategy')}</StyledSettingLabel>
          <ToolGroupBtn
            exclusive
            size="medium"
            value={randomPlayStrategy}
            onChange={(_, value) => setRandomPlayStrategy(value)}
            items={RANDOM_PLAY_STRATEGIES}
            required
          />
        </StyledSettingItem>
      </StyledSettingContainer>
    </Dialog>
  );
};

export default GlobalSetting;
