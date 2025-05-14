'use client';

import { useShortcut } from '#/hooks/useShortcut';
import { stopPropagation } from '#/utils';
import { CloseRounded } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  dialogClasses,
  DialogContent,
  Divider,
  IconButton,
  DialogProps as RawDialogProps,
  Stack,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import { StyledDialogHeader, StyledDialogTitle, StyledDialogTitleWrapper } from './style';

const DIALOG_SX = {
  [`& .${dialogClasses.paper}`]: {
    margin: '0 16px',
    width: 'calc(100% - 32px)',
  },
};

interface DialogProps {
  open: boolean;
  onClose?: () => void;
  onOk?: () => void | Promise<void>;
  onCancel?: () => void;
  children?: React.ReactNode;
  leftFooterSlot?: React.ReactNode;
  title?: React.ReactNode;
  titleRightSlot?: React.ReactNode;
  dialogProps?: Partial<RawDialogProps>;
  onlyClose?: boolean;
}
const CompDialog = (props: DialogProps) => {
  const {
    open,
    onClose,
    onCancel,
    onOk,
    children,
    leftFooterSlot: leftFooter,
    title,
    titleRightSlot,
    dialogProps,
    onlyClose,
  } = props;
  const t = useTranslations();
  const [loading, setLoading] = useState(false);

  const handleCancel = useCallback(() => {
    onCancel?.();
    onClose?.();
  }, [onCancel, onClose]);

  const handleOk = useCallback(async () => {
    setLoading(true);
    await onOk?.();
    setLoading(false);
  }, [onOk]);

  useShortcut({
    onEscPressed: onClose,
    eventOption: { stopWhenFirstCalled: true },
  });

  return (
    <Dialog
      {...dialogProps}
      open={open}
      onClose={onClose}
      fullWidth
      sx={{
        ...dialogProps?.sx,
        ...DIALOG_SX,
      }}
      aria-modal={false}
      disableEscapeKeyDown
    >
      <StyledDialogHeader>
        <IconButton
          onClick={ev => {
            stopPropagation(ev);
            onClose?.();
          }}
        >
          <CloseRounded />
        </IconButton>

        {!!title && (
          <StyledDialogTitleWrapper>
            <StyledDialogTitle>{title}</StyledDialogTitle>

            {titleRightSlot}
          </StyledDialogTitleWrapper>
        )}
      </StyledDialogHeader>

      {!!title && <Divider />}

      <DialogContent sx={{ padding: '12px 16px' }}>{children}</DialogContent>

      <Divider />

      <DialogActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: '4px' }}>{leftFooter}</Box>
        <Stack
          direction="row"
          spacing={2}
        >
          <Button
            onClick={handleCancel}
            variant="outlined"
            size="small"
          >
            {onlyClose ? t('Common.Close') : t('Common.Cancel')}
          </Button>
          {!onlyClose && (
            <Button
              onClick={handleOk}
              loading={loading}
              variant="contained"
              size="small"
            >
              {t('Common.OK')}
            </Button>
          )}
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default CompDialog;
