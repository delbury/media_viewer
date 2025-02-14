import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import { Box, Card, CardActions, CardHeader, IconButton } from '@mui/material';

const TOOLS = [
  {
    title: 'File',
    path: '/tools',
  },
];

export default function Tools() {
  return (
    <Box>
      {TOOLS.map(tool => (
        <Card key={tool.path}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <CardHeader title={tool.title} />
            <CardActions>
              <IconButton>
                <OpenInNewOutlinedIcon />
              </IconButton>
            </CardActions>
          </Box>
        </Card>
      ))}
    </Box>
  );
}
