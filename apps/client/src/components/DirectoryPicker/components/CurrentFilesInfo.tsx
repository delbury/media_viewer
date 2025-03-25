import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { StyledHighlightText } from '../style/current-files-info';

interface CurrentFilesInfoProps {
  total: number;
  self: number;
}

const CurrentFilesInfo = ({ total, self }: CurrentFilesInfoProps) => {
  const t = useTranslations();

  return (
    <Typography
      color="textSecondary"
      variant="subtitle1"
      sx={{ lineHeight: 1, textAlign: 'right' }}
    >
      <Box>
        <Typography
          variant="subtitle2"
          variantMapping={{ subtitle2: 'span' }}
        >
          {`${t('Tools.SelfFiles')}: `}
          <StyledHighlightText>{self}</StyledHighlightText>
        </Typography>
      </Box>

      <Box>
        <Typography
          variant="subtitle2"
          variantMapping={{ subtitle2: 'span' }}
        >
          {`${t('Tools.TotalFiles')}: `}
          <StyledHighlightText>{total}</StyledHighlightText>
        </Typography>
      </Box>
    </Typography>
  );
};

export default CurrentFilesInfo;
