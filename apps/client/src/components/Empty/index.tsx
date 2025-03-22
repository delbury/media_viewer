import { styled, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { StyledEmptyWrapper } from './style';

const EmptyTip = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

const Empty = ({ label }: { label?: string }) => {
  const t = useTranslations();

  const text = label ?? t('Common.Empty');

  return (
    <StyledEmptyWrapper>
      <EmptyTip>{text}</EmptyTip>
    </StyledEmptyWrapper>
  );
};

export default Empty;
