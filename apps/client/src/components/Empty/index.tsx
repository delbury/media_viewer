import { FolderOffOutlined } from '@mui/icons-material';
import { Box, SxProps, Theme } from '@mui/material';
import { useTranslations } from 'next-intl';
import { StyledEmptyTip, StyledEmptyWrapper } from './style';

const Empty = ({ label, sx }: { label?: string; sx?: SxProps<Theme> }) => {
  const t = useTranslations();
  const text = label ?? t('Common.Empty');

  return (
    <StyledEmptyWrapper sx={sx}>
      <StyledEmptyTip>
        <FolderOffOutlined fontSize="large" />
        <Box>{text}</Box>
      </StyledEmptyTip>
    </StyledEmptyWrapper>
  );
};

export default Empty;
