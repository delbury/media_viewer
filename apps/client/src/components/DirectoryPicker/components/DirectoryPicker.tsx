'use client';

import ErrorBoundary from '#/components/ErrorBoundary';
import { useDialogState } from '#/hooks/useDialogState';
import { DirectoryInfo } from '#pkgs/apis';
import { Button } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { StyledBtnRow } from '../style/directory-picker';
import PickViewer from './PickViewer';
import SelectedPathInfo from './SelectedPathInfo';

export default function DirectoryPicker() {
  const { visible, handleClose, handleOpen } = useDialogState(true);
  const t = useTranslations();
  const [selectedPathList, setSelectedPathList] = useState<DirectoryInfo[]>([]);

  return (
    <ErrorBoundary>
      <StyledBtnRow>
        <Button
          variant="contained"
          size="small"
          onClick={handleOpen}
          sx={{ flexShrink: 0 }}
        >
          {t('Tools.SelectDirectory')}
        </Button>

        <SelectedPathInfo selectedPathList={selectedPathList} />
      </StyledBtnRow>

      <PickViewer
        visible={visible}
        onClose={handleClose}
        onOk={setSelectedPathList}
      />
    </ErrorBoundary>
  );
}
