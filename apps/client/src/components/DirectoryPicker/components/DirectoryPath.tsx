import { OtherHousesOutlined } from '@mui/icons-material';
import { Box, Breadcrumbs, Chip } from '@mui/material';
import { DirectoryInfo } from '@shared';
import { useEffect, useRef } from 'react';
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
  const wrapperRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (wrapperRef.current) {
      wrapperRef.current.scrollTo({
        top: wrapperRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [pathList]);

  return (
    <Breadcrumbs
      ref={wrapperRef}
      separator={PATH_SEPARATOR}
      classes={{ root: classes.root, ol: classes.ol, separator: classes.separator }}
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
