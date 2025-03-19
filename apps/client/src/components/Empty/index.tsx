import { Box, styled, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

const EmptyTip = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

const Empty = ({ label }: { label?: string }) => {
  const t = useTranslations();

  const text = label ?? t('Common.Empty');

  return (
    <Box
      sx={{
        margin: 'auto 0',
        height: '100%',
        minHeight: 100,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <EmptyTip>{text}</EmptyTip>
    </Box>
  );
};

export default Empty;
