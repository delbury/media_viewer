'use client';

import { usePersistentConfig } from '#/hooks/usePersistentConfig';
import { Switch } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import Dialog from '../Dialog';
import ToolGroupBtn from '../ToolGroupBtn';
import { StyledSettingContainer, StyledSettingItem, StyledSettingLabel } from './style';

const DURATION_ROUND_TO_OPTIONS = [
  { label: '0', value: 0 },
  { label: '1', value: 1 },
  { label: '10', value: 10 },
];

export const DIR_PATH_REVERSE_KEY = 'dirPathReverse';
export const VIDEO_DURATION_ROUND_TO_KEY = 'videoDurationRoundTo';
export const FILE_SIZE_ROUND_TO_KEY = 'fileSizeRoundTo';

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
        <StyledSettingItem>
          <StyledSettingLabel>{t('Setting.DirectoryOrderReverse')}</StyledSettingLabel>
          <Switch
            checked={dirPathReverse}
            onChange={(_, val) => setDirPathReverse(val)}
          />
        </StyledSettingItem>
        <StyledSettingItem>
          <StyledSettingLabel>{t('Setting.VideoDurationSortRoundTo')}</StyledSettingLabel>
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
          <StyledSettingLabel>{t('Setting.FileSizeSortRoundTo')}</StyledSettingLabel>
          <ToolGroupBtn
            exclusive
            rawLabel
            size="medium"
            value={fileSizeRoundTo}
            onChange={(_, value) => setFileSizeRoundTo(value)}
            items={DURATION_ROUND_TO_OPTIONS}
          />
        </StyledSettingItem>
      </StyledSettingContainer>
    </Dialog>
  );
};

export default GlobalSetting;
