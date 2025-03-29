import Link from '#/components/Link';
import { TFunction } from '#/types';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import { Box, Card, CardActionArea, CardActions, CardHeader } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

const getTools = (t: TFunction) => [
  {
    title: t('Tools.RepeatFileAnalyzer'),
    path: '/tools/repeat-file',
  },
];

export default function Tools() {
  const t = useTranslations();
  const tools = useMemo(() => getTools(t), [t]);

  return (
    <Box>
      {tools.map(tool => (
        <Card key={tool.path}>
          <Link
            href={tool.path}
            color="inherit"
            underline="none"
          >
            <CardActionArea
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                ':hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <CardHeader title={tool.title} />
              <CardActions>
                <OpenInNewOutlinedIcon />
              </CardActions>
            </CardActionArea>
          </Link>
        </Card>
      ))}
    </Box>
  );
}
