import { Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

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
    >
      {`${t('Common.Self')}: `}
      <Typography
        variant="subtitle2"
        variantMapping={{ subtitle2: 'span' }}
        color="primary"
        sx={{ fontWeight: 'bold', marginInlineEnd: '1em' }}
      >
        {self}
      </Typography>

      {`${t('Common.Total')}: `}
      <Typography
        variant="subtitle2"
        variantMapping={{ subtitle2: 'span' }}
        color="primary"
        sx={{ fontWeight: 'bold' }}
      >
        {total}
      </Typography>
    </Typography>
  );
};

export default FilesInfo;
