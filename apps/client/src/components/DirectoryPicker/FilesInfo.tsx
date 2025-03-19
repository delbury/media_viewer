import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { HighlightText } from './style';

interface FilesInfoProps {
  total: number;
  self: number;
}

const FilesInfo = ({ total, self }: FilesInfoProps) => {
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
          <HighlightText>{self}</HighlightText>
        </Typography>
      </Box>

      <Box>
        <Typography
          variant="subtitle2"
          variantMapping={{ subtitle2: 'span' }}
        >
          {`${t('Tools.TotalFiles')}: `}
          <HighlightText>{total}</HighlightText>
        </Typography>
      </Box>
    </Typography>
  );
};

export default FilesInfo;
