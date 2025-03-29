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
import { useCallback, useState } from 'react';
import { StyledDialogTitleRow } from './style';

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

  return (
    <Dialog
      {...dialogProps}
      open={open}
      onClose={onClose}
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          margin: '0 16px',
          width: 'calc(100% - 32px)',
        },
      }}
      aria-modal={false}
    >
      <StyledDialogTitleRow>
        <DialogTitle
          sx={{
            padding: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '100%',
          }}
        >
          {title}
        </DialogTitle>
        {titleRightSlot}
      </StyledDialogTitleRow>

      <Divider />

      <DialogContent sx={{ padding: '12px 16px' }}>{children}</DialogContent>

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
