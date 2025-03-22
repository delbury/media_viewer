import { OtherHousesOutlined } from '@mui/icons-material';
import { Box, Breadcrumbs, Chip } from '@mui/material';
import { DirectoryInfo } from '@shared';
import { PATH_SEPARATOR } from '../constant';
import { StyledPathNodeTitle, StyledPathNodeWrapper, useStyles } from '../style';

const CountTag = ({ count }: { count: number }) => {
  return <span style={{ marginInlineStart: '0.5em' }}>: {count}</span>;
};

interface DirectoryPathProps {
  pathList: DirectoryInfo[];
  onItemClick?: (index: number) => void;
}

const DirectoryPath = ({ pathList, onItemClick }: DirectoryPathProps) => {
  const classes = useStyles();

  return (
    <Breadcrumbs
      separator={PATH_SEPARATOR}
      classes={{ ol: classes.ol }}
      sx={{ marginBottom: '8px' }}
    >
      {pathList.map((path, index) => {
        const isFirst = index === 0;
        const isLast = index === pathList.length - 1;
        const key = `${path}_${index}`;

        return (
          <StyledPathNodeWrapper key={key}>
            <Chip
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {isFirst ? (
                    <div style={{ fontSize: 0 }}>
                      <OtherHousesOutlined fontSize="small" />
                    </div>
                  ) : (
                    <StyledPathNodeTitle>{path.name}</StyledPathNodeTitle>
                  )}
                  <CountTag count={path.totalFilesCount} />
                </Box>
              }
              size="small"
              variant={isLast ? 'filled' : 'outlined'}
              color={isLast ? 'primary' : 'default'}
              onClick={() => onItemClick?.(index)}
              style={{ maxWidth: 'min(200px, 30vw)' }}
            />
          </StyledPathNodeWrapper>
        );
      })}
    </Breadcrumbs>
  );
};

export default DirectoryPath;
