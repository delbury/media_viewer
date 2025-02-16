import { TFunction } from '@/types';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import { Box, Card, CardActions, CardHeader, Link } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

const getTools = (t: TFunction) => [
  {
    title: t('Repeat File Analyzer'),
    path: '/tools',
  },
];

export default function Tools() {
  const t = useTranslations('Tools');
  const tools = useMemo(() => getTools(t), [t]);

  return (
    <Box>
      {tools.map(tool => (
        <Card key={tool.path}>
          <Link
            href=""
            color="inherit"
            underline="none"
            sx={{ display: 'flex', justifyContent: 'space-between' }}
          >
            <CardHeader title={tool.title} />
            <CardActions>
              <OpenInNewOutlinedIcon />
            </CardActions>
          </Link>
        </Card>
      ))}
    </Box>
  );
}
