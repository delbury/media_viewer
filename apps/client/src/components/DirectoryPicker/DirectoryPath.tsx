import { Box, Breadcrumbs, Chip } from '@mui/material';
import { PathNodeTitle, PathNodeWrapper, useStyles } from './style';
import { OtherHousesOutlined } from '@mui/icons-material';
import { DirectoryInfo } from '@shared';

const CountTag = ({ count }: { count: number }) => {
  return <span style={{ marginInlineStart: '0.5em' }}>: {count}</span>;
};

const SEPARATOR = '/';

interface DirectoryPathProps {
  pathList: DirectoryInfo[];
  onItemClick?: (index: number) => void;
}

const DirectoryPath = ({ pathList, onItemClick }: DirectoryPathProps) => {
  const classes = useStyles();

  return (
    <Breadcrumbs
      separator={SEPARATOR}
      classes={{ ol: classes.ol }}
      sx={{ marginBottom: '8px' }}
    >
      {pathList.map((path, index) => {
        const isFirst = index === 0;
        const isLast = index === pathList.length - 1;
        const key = `${path}_${index}`;

        return (
          <PathNodeWrapper key={key}>
            <Chip
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {isFirst ? (
                    <div style={{ fontSize: 0 }}>
                      <OtherHousesOutlined fontSize="small" />
                    </div>
                  ) : (
                    <PathNodeTitle>{path.name}</PathNodeTitle>
                  )}
                  <CountTag count={path.totalFilesCount} />
                </Box>
              }
              size="small"
              variant={isLast ? 'filled' : 'outlined'}
              color={isLast ? 'primary' : 'default'}
              onClick={() => onItemClick?.(index)}
              style={{ maxWidth: 'min(300px, 35vw)' }}
            />
          </PathNodeWrapper>
        );
      })}
    </Breadcrumbs>
  );
};

export default DirectoryPath;
