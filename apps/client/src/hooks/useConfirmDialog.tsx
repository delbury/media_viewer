import { ConfirmDialogContext } from '#/components/ConfirmDialogProvider/Context';
import { useCallback, useContext, useState } from 'react';

interface UseConfirmDialogParams {
  title?: string;
  description?: string;
  onOk?: () => unknown | Promise<unknown>;
}

export const useConfirmDialog = ({ title, description, onOk }: UseConfirmDialogParams = {}) => {
  const { openConfirmDialog, closeConfirmDialog } = useContext(ConfirmDialogContext);

  const handleOpen = useCallback(
    (args?: UseConfirmDialogParams) => {
      openConfirmDialog(
        args ?? {
          title,
          description,
          onOk,
        }
      );
    },
    [description, onOk, openConfirmDialog, title]
  );

  // 跳过确认选项
  const handleOpenSkipConfirm = useCallback(async () => {
    await onOk?.();
    closeConfirmDialog();
  }, [closeConfirmDialog, onOk]);

  return {
    openConfirmDialog: handleOpen,
    closeConfirmDialog,
    openConfirmDialogSkipConfirm: handleOpenSkipConfirm,
  };
};

// 可以配置多个确认弹窗，通过 key 区分
export const useConfirmDialogByKeys = <K extends string>(
  params: Record<K, UseConfirmDialogParams>
) => {
  const [currentKey, setCurrentKey] = useState<K | null>(null);

  const { openConfirmDialog, openConfirmDialogSkipConfirm, closeConfirmDialog } = useConfirmDialog(
    currentKey ? params[currentKey] : void 0
  );

  const handleOpenWrapped = useCallback(
    (key: K) => {
      setCurrentKey(key);
      openConfirmDialog(params[key]);
    },
    [openConfirmDialog, params]
  );

  const handleOpenSkipConfirmWrapped = useCallback(
    (key: K) => {
      setCurrentKey(key);
      openConfirmDialogSkipConfirm();
    },
    [openConfirmDialogSkipConfirm]
  );

  return {
    openConfirmDialog: handleOpenWrapped,
    openConfirmDialogSkipConfirm: handleOpenSkipConfirmWrapped,
    closeConfirmDialog,
    currentKey,
  };
};
