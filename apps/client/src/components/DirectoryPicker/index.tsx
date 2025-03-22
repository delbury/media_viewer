'use client';

import { useDialogState } from '@/hooks/useDialogState';
import { Box, Button } from '@mui/material';
import { DirectoryInfo } from '@shared';
import { useTranslations } from 'next-intl';
import ErrorBoundary from '../ErrorBoundary';
import PickViewer from './PickViewer';

export default function DirectoryPicker() {
  const { visible, handleClose, handleOpen } = useDialogState(true);
  const t = useTranslations();

  const handlePickOk = (dirInfo?: DirectoryInfo) => {
    console.log(dirInfo);
  };

  return (
    <ErrorBoundary>
      <Box>
        <Button
          variant="contained"
          size="small"
          onClick={handleOpen}
        >
          {t('Tools.SelectDirectory')}
        </Button>

        {visible && (
          <PickViewer
            visible={visible}
            onClose={handleClose}
            onOk={handlePickOk}
          />
        )}
      </Box>
    </ErrorBoundary>
  );
}
