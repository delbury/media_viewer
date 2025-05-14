'use client';

import ErrorBoundary from '#/components/ErrorBoundary';
import { useDialogState } from '#/hooks/useDialogState';
import { DirectoryInfo } from '#pkgs/apis';
import { Button } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { StyledBtnRow } from '../style/directory-picker';
import PickViewer from './PickViewer';
import SelectedPathInfo from './SelectedPathInfo';

interface DirectoryPickerProps {
  defaultVisible?: boolean;
  onCurrentDirChange?: (dir?: DirectoryInfo) => void;
  storageKeySuffix?: string;
}

export default function DirectoryPicker({
  defaultVisible = false,
  onCurrentDirChange,
  storageKeySuffix,
}: DirectoryPickerProps = {}) {
  const { visible, handleClose, handleOpen } = useDialogState(defaultVisible);
  const t = useTranslations();
  const [selectedPathList, setSelectedPathList] = useState<DirectoryInfo[]>([]);

  useEffect(() => {
    onCurrentDirChange?.(selectedPathList.at(-1));
  }, [onCurrentDirChange, selectedPathList]);

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
        storageKeySuffix={storageKeySuffix}
      />
    </ErrorBoundary>
  );
}
