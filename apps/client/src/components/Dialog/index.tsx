import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
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
}
const CompDialog = (props: DialogProps) => {
  const { open, onClose, loading, onCancel, onOk, children, leftFooterSlot: leftFooter, title, titleRightSlot } = props;
  const t = useTranslations();

  const handleCancel = useCallback(() => {
    onCancel?.();
    onClose?.();
  }, [onCancel, onClose]);

  return (
    <Dialog
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
