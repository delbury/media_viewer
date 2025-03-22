import Dialog from '@/components/Dialog';
import { useDialogState } from '@/hooks/useDialogState';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo } from 'react';

export const useConfirmDialog = (onOk?: () => unknown | Promise<unknown>) => {
  const { visible, handleOpen, handleClose } = useDialogState();
  const t = useTranslations();

  const dialogElm = useMemo(
    () =>
      visible && (
        <Dialog
          open={visible}
          title={t('Common.AreYouSure')}
          dialogProps={{
            maxWidth: 'xs',
          }}
          onCancel={handleClose}
          onOk={async () => {
            await onOk?.();
            handleClose();
          }}
          onClose={handleClose}
        >
          {t('Common.AreYouSureDoOperation')}
        </Dialog>
      ),
    [visible, t, onOk, handleClose]
  );

  // 跳过确认选项
  const handleOpenSkipConfirm = useCallback(async () => {
    await onOk?.();
    handleClose();
  }, [handleClose, onOk]);

  return {
    dialog: dialogElm,
    handleOpen,
    handleOpenSkipConfirm,
    handleClose,
  };
};
