import ScrollBox, { ScrollBoxInstance } from '@/components/ScrollBox';
import { Typography } from '@mui/material';
import { DirectoryInfo } from '@shared';
import { useTranslations } from 'next-intl';
import React, { useEffect, useRef } from 'react';
import { PATH_SEPARATOR } from '../constant';
import { StyledSelectedInfoName, StyledSelectedInfoWrapper } from '../style';

interface SelectedPathInfoProps {
  selectedPathList: DirectoryInfo[];
}

const SelectedPathInfo = ({ selectedPathList }: SelectedPathInfoProps) => {
  const scrollRef = useRef<ScrollBoxInstance>(null);
  const t = useTranslations();

  useEffect(() => {
    scrollRef.current?.scrollToEnd();
  }, [selectedPathList]);

  return (
    <ScrollBox
      ref={scrollRef}
      floatBarDisabled
    >
      <StyledSelectedInfoWrapper>
        {selectedPathList.length === 1 && (
          <>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary' }}
            >
              {PATH_SEPARATOR}
            </Typography>
            <StyledSelectedInfoName variant="body2">{t('Tools.RootDirectory')}</StyledSelectedInfoName>
          </>
        )}
        {selectedPathList.map((node, index) => {
          if (!index) return null;
          const isLast = index === selectedPathList.length - 1;
          return (
            <React.Fragment key={node.fullPath}>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary' }}
              >
                {PATH_SEPARATOR}
              </Typography>
              <StyledSelectedInfoName
                variant="body2"
                isLast={isLast}
              >
                {node.name}
              </StyledSelectedInfoName>
            </React.Fragment>
          );
        })}
      </StyledSelectedInfoWrapper>
    </ScrollBox>
  );
};

export default SelectedPathInfo;
