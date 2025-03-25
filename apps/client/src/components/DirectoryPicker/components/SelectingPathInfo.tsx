import ScrollBox, { ScrollBoxInstance } from '@/components/ScrollBox';
import { CatchingPokemonOutlined } from '@mui/icons-material';
import { Box, Chip, Typography } from '@mui/material';
import { DirectoryInfo } from '@shared';
import React, { useEffect, useRef } from 'react';
import { PATH_SEPARATOR } from '../constant';
import { useSwitchWrapBtn } from '../hooks/useSwitchBtn';
import { StyledPathNode, StyledPathNodeTitle, StyledPathWrapper } from '../style/selecting-path-info';

const CountTag = ({ count }: { count: number }) => {
  return <span style={{ marginInlineStart: '0.5em' }}>: {count}</span>;
};

interface DirectoryPathProps {
  pathList: DirectoryInfo[];
  onItemClick?: (index: number) => void;
}

const DirectoryPath = ({ pathList, onItemClick }: DirectoryPathProps) => {
  const scrollRef = useRef<ScrollBoxInstance>(null);
  // 布局是否换行
  const { isWrap, Btn } = useSwitchWrapBtn(true, 'directoryPickerSelectingSwitchWrapper');

  // 路径变更时，滚动到底部
  useEffect(() => {
    scrollRef.current?.scrollToEnd();
  }, [pathList, isWrap]);

  return (
    <ScrollBox
      ref={scrollRef}
      sx={{ maxHeight: '10vh', display: 'flex', flexDirection: 'column', mb: '8px' }}
    >
      <StyledPathWrapper isWrap={isWrap}>
        {Btn}

        {pathList.map((path, index) => {
          const isFirst = index === 0;
          const isLast = index === pathList.length - 1;
          const key = `${path}_${index}`;

          return (
            <React.Fragment key={key}>
              <StyledPathNode>
                <Chip
                  icon={isFirst ? <CatchingPokemonOutlined fontSize="inherit" /> : void 0}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StyledPathNodeTitle>{path.name}</StyledPathNodeTitle>
                      <CountTag count={path.totalFilesCount} />
                    </Box>
                  }
                  size="small"
                  variant={isLast ? 'filled' : 'outlined'}
                  color={isLast ? 'primary' : 'default'}
                  onClick={() => onItemClick?.(index)}
                  sx={{ maxWidth: 'min(160px, 30vw)' }}
                />
              </StyledPathNode>
              {!isLast && <Typography variant="body1">{PATH_SEPARATOR}</Typography>}
            </React.Fragment>
          );
        })}
      </StyledPathWrapper>
    </ScrollBox>
  );
};

export default DirectoryPath;
