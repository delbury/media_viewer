import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  DialogProps as RawDialogProps,
  Stack,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef } from 'react';
import { StyledDialogTitleRow } from './style';

interface DialogProps {
  open: boolean;
  onClose?: () => void;
  loading?: boolean;
  onOk?: () => void;
  onCancel?: () => void;
  children?: React.ReactNode;
  leftFooterSlot?: React.ReactNode;
  title?: React.ReactNode;
  titleRightSlot?: React.ReactNode;
  dialogProps?: Partial<RawDialogProps>;
}
const CompDialog = (props: DialogProps) => {
  const {
    open,
    onClose,
    loading,
    onCancel,
    onOk,
    children,
    leftFooterSlot: leftFooter,
    title,
    titleRightSlot,
    dialogProps,
  } = props;
  const t = useTranslations();

  const handleCancel = useCallback(() => {
    onCancel?.();
    onClose?.();
  }, [onCancel, onClose]);

  // 阻止移动端下拉页面刷新
  const abortController = useRef<AbortController>(null);
  useEffect(() => {
    if (open) {
      const controller = new AbortController();
      abortController.current = controller;
      document.addEventListener('touchmove', (ev: Event) => ev.preventDefault(), {
        passive: false,
        signal: controller.signal,
      });
    } else {
      abortController.current?.abort();
      abortController.current = null;
    }
    return () => {
      abortController.current?.abort();
      abortController.current = null;
    };
  }, [open]);

  return (
    <Dialog
      {...dialogProps}
      open={open}
      onClose={onClose}
      fullWidth
    >
      <StyledDialogTitleRow>
        <DialogTitle sx={{ padding: 0 }}>{title}</DialogTitle>
        {titleRightSlot}
      </StyledDialogTitleRow>

      <Divider />

      <DialogContent>{children}</DialogContent>

      <Divider />

      <DialogActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box>{leftFooter}</Box>
        <Stack
          direction="row"
          spacing={2}
        >
          <Button
            onClick={handleCancel}
            variant="outlined"
            size="small"
          >
            {t('Common.Cancel')}
          </Button>
          <Button
            onClick={onOk}
            loading={loading}
            variant="contained"
            size="small"
          >
            {t('Common.OK')}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default CompDialog;
