import Dialog from '#/components/Dialog';
import { useDialogState } from '#/hooks/useDialogState';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';

interface UseConfirmDialogParams {
  title?: string;
  description?: string;
  onOk?: () => unknown | Promise<unknown>;
}

export const useConfirmDialog = function ({
  title,
  description,
  onOk,
}: UseConfirmDialogParams = {}) {
  const { visible, handleOpen, handleClose } = useDialogState();
  const t = useTranslations();

  const ConfirmDialog = useMemo(
    () =>
      visible && (
        <Dialog
          open={visible}
          title={title ?? t('Common.AreYouSure')}
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
          {description ?? t('Common.AreYouSureDoOperation')}
        </Dialog>
      ),
    [visible, title, t, handleClose, description, onOk]
  );

  // 跳过确认选项
  const handleOpenSkipConfirm = useCallback(async () => {
    await onOk?.();
    handleClose();
  }, [handleClose, onOk]);

  return {
    ConfirmDialog,
    handleOpen,
    handleOpenSkipConfirm,
    handleClose,
  };
};

// 可以配置多个确认弹窗，通过 key 区分
export const useConfirmDialogByKeys = <T extends string = string>(
  params: Record<T, UseConfirmDialogParams>,
  defaultKey?: T
) => {
  const [currentKey, setCurrentKey] = useState<T | null>(null);
  const currentParams = useMemo(() => {
    if (currentKey) return params[currentKey];
    if (defaultKey) return params[defaultKey];
    return;
  }, [params, currentKey, defaultKey]);

  const { ConfirmDialog, handleOpen, handleOpenSkipConfirm, handleClose } =
    useConfirmDialog(currentParams);

  const handleOpenWrapped = useCallback(
    (key: T) => {
      setCurrentKey(key);
      handleOpen();
    },
    [handleOpen, setCurrentKey]
  );

  const handleOpenSkipConfirmWrapped = useCallback(
    (key: T) => {
      setCurrentKey(key);
      handleOpenSkipConfirm();
    },
    [handleOpenSkipConfirm, setCurrentKey]
  );

  return {
    ConfirmDialog,
    handleOpen: handleOpenWrapped,
    handleOpenSkipConfirm: handleOpenSkipConfirmWrapped,
    handleClose,
  };
};
