import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';

interface DialogProps {
  open: boolean;
  onClose?: () => void;
  loading?: boolean;
  onOk?: () => void;
  onCancel?: () => void;
  children?: React.ReactNode;
  leftFooter?: React.ReactNode;
  title?: React.ReactNode;
}
const CompDialog = (props: DialogProps) => {
  const { open, onClose, loading, onCancel, onOk, children, leftFooter, title } = props;
  const t = useTranslations();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box>{leftFooter}</Box>
        <Stack
          direction="row"
          spacing={2}
        >
          <Button
            onClick={onCancel}
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
