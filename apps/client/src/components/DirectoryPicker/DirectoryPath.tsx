import { Box, Breadcrumbs, Chip, IconButton } from '@mui/material';
import { PathBtn, useStyles } from './style';
import { OtherHouses, OtherHousesOutlined } from '@mui/icons-material';
import { DirectoryInfo } from '@shared';

const SEPARATOR = '/';

interface DirectoryPathProps {
  pathList: DirectoryInfo[];
  onItemClick?: (index: number) => void;
}

const DirectoryPath = ({ pathList, onItemClick }: DirectoryPathProps) => {
  const classes = useStyles();

  const isAtHome = pathList.length === 1;

  return (
    <Breadcrumbs
      separator={SEPARATOR}
      classes={{ ol: classes.ol }}
    >
      {pathList.map((path, index) => {
        const isFirst = index === 0;
        const isLast = index === pathList.length - 1;
        const key = `${path}_${index}`;
        return isFirst ? (
          <Box
            sx={{ fontSize: 0 }}
            key={key}
          >
            <IconButton
              size="small"
              color={isAtHome ? 'primary' : void 0}
              onClick={() => onItemClick?.(index)}
            >
              {isAtHome ? <OtherHouses /> : <OtherHousesOutlined />}
            </IconButton>
          </Box>
        ) : (
          <PathBtn key={key}>
            <Chip
              label={path.name}
              size="small"
              variant={isLast ? 'filled' : 'outlined'}
              color={isLast ? 'primary' : 'default'}
              onClick={() => onItemClick?.(index)}
              style={{ maxWidth: 'min(300px, 35vw)' }}
            />
          </PathBtn>
        );
      })}
    </Breadcrumbs>
  );
};

export default DirectoryPath;
