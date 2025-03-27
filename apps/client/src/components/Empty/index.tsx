import { FolderOffOutlined } from '@mui/icons-material';
import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import { StyledEmptyTip, StyledEmptyWrapper } from './style';

const Empty = ({ label }: { label?: string }) => {
  const t = useTranslations();

  const text = label ?? t('Common.Empty');

  return (
    <StyledEmptyWrapper>
      <StyledEmptyTip>
        <FolderOffOutlined fontSize="large" />
        <Box>{text}</Box>
      </StyledEmptyTip>
    </StyledEmptyWrapper>
  );
};

export default Empty;
