import ScrollBox, { ScrollBoxInstance } from '@/components/ScrollBox';
import { OtherHousesOutlined } from '@mui/icons-material';
import { Box, Chip, Typography } from '@mui/material';
import { DirectoryInfo } from '@shared';
import { useTranslations } from 'next-intl';
import React, { useEffect, useRef, useState } from 'react';
import { PATH_SEPARATOR } from '../constant';
import { StyledPathNode, StyledPathNodeTitle, StyledPathWrapper } from '../style';

const CountTag = ({ count }: { count: number }) => {
  return <span style={{ marginInlineStart: '0.5em' }}>: {count}</span>;
};

interface DirectoryPathProps {
  pathList: DirectoryInfo[];
  onItemClick?: (index: number) => void;
}

const DirectoryPath = ({ pathList, onItemClick }: DirectoryPathProps) => {
  const t = useTranslations();
  const scrollRef = useRef<ScrollBoxInstance>(null);
  // 布局是否换行
  const [isWrap, setIsWrap] = useState(true);

  // 路径变更时，滚动到底部
  useEffect(() => {
    scrollRef.current?.scrollToBottom();
  }, [pathList]);

  return (
    <Box>
      {/* <Typography sx={{ color: 'text.secondary', marginBottom: '4px' }}>{t('Tools.CurrentPath')}</Typography> */}
      <ScrollBox
        ref={scrollRef}
        sx={{ maxHeight: '10vh', display: 'flex', flexDirection: 'column' }}
      >
        <StyledPathWrapper isWrap={isWrap}>
          {pathList.map((path, index) => {
            const isFirst = index === 0;
            const isLast = index === pathList.length - 1;
            const key = `${path}_${index}`;

            return (
              <React.Fragment key={key}>
                <StyledPathNode>
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
                    sx={{ maxWidth: 'min(200px, 30vw)' }}
                  />
                </StyledPathNode>
                {!isLast && <Typography variant="body1">{PATH_SEPARATOR}</Typography>}
              </React.Fragment>
            );
          })}
        </StyledPathWrapper>
      </ScrollBox>
    </Box>
  );
};

export default DirectoryPath;
