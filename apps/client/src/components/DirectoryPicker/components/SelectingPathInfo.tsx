'use client';

import ScrollBox, { ScrollBoxInstance } from '#/components/ScrollBox';
import { DirectoryInfo } from '#pkgs/apis';
import { CatchingPokemonOutlined } from '@mui/icons-material';
import { Box, Chip, Typography } from '@mui/material';
import React, { useEffect, useRef } from 'react';
import { PATH_SEPARATOR } from '../constant';
import { useSwitchWrapBtn } from '../hooks/useSwitchBtn';
import {
  StyledCountTag,
  StyledPathNode,
  StyledPathNodeTitle,
  StyledPathWrapper,
} from '../style/selecting-path-info';

interface DirectoryPathProps {
  pathList: DirectoryInfo[];
  onItemClick?: (index: number) => void;
  storageKeySuffix?: string;
}

const DirectoryPath = ({ pathList, onItemClick, storageKeySuffix = '' }: DirectoryPathProps) => {
  const scrollRef = useRef<ScrollBoxInstance>(null);
  // 布局是否换行
  const { isWrap, SwitchBtn } = useSwitchWrapBtn(
    true,
    `directoryPickerSelectingSwitchWrapper${storageKeySuffix}`
  );

  // 路径变更时，滚动到底部
  useEffect(() => {
    scrollRef.current?.scrollToEnd();
  }, [pathList, isWrap]);

  return (
    <ScrollBox
      ref={scrollRef}
      sx={{ maxHeight: '10dvh', display: 'flex', flexDirection: 'column', mb: '4px' }}
    >
      <StyledPathWrapper isWrap={isWrap}>
        {SwitchBtn}

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
                      <StyledCountTag>{path.totalFilesCount}</StyledCountTag>
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
