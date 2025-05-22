'use client';

import { useTranslations } from 'next-intl';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import Dialog from '../Dialog';
import { ConfirmDialogContext, ConfirmDialogContextValue } from './Context';

const ConfirmDialogProvider = ({ children }: { children?: React.ReactNode }) => {
  const t = useTranslations();
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const onOkHandler = useRef<null | (() => unknown | Promise<unknown>)>(null);

  const handleOpen = useCallback<ConfirmDialogContextValue['openConfirmDialog']>(
    ({ title, description, onOk } = {}) => {
      setTitle(title ?? null);
      setDescription(description ?? null);
      // setOnOk(onOk ?? null);
      onOkHandler.current = onOk ?? null;
      setVisible(true);
    },
    []
  );

  const handleClose = useCallback(() => {
    setTitle(null);
    setDescription(null);
    onOkHandler.current = null;
    setVisible(false);
  }, []);

  const value = useMemo<ConfirmDialogContextValue>(
    () => ({
      openConfirmDialog: handleOpen,
      closeConfirmDialog: handleClose,
    }),
    [handleClose, handleOpen]
  );

  return (
    <ConfirmDialogContext.Provider value={value}>
      {children}
      {visible && (
        <Dialog
          open={visible}
          title={title ?? t('Common.AreYouSure')}
          dialogProps={{
            maxWidth: 'xs',
          }}
          onCancel={handleClose}
          onOk={async () => {
            await onOkHandler.current?.();
            handleClose();
          }}
          onClose={handleClose}
        >
          {description ?? t('Common.AreYouSureDoOperation')}
        </Dialog>
      )}
    </ConfirmDialogContext.Provider>
  );
};

export default ConfirmDialogProvider;
