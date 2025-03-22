import { Typography } from '@mui/material';
import { DirectoryInfo } from '@shared';
import React from 'react';
import { PATH_SEPARATOR } from '../constant';
import { StyledSelectedInfoName, StyledSelectedInfoWrapper } from '../style';

interface SelectedPathInfoProps {
  selectedPathList: DirectoryInfo[];
}

const SelectedPathInfo = ({ selectedPathList }: SelectedPathInfoProps) => {
  return (
    <StyledSelectedInfoWrapper>
      {selectedPathList.map((node, index) => {
        if (!index) return null;
        return (
          <React.Fragment key={node.fullPath}>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary' }}
            >
              {PATH_SEPARATOR}
            </Typography>
            <StyledSelectedInfoName variant="body2">{node.name}</StyledSelectedInfoName>
          </React.Fragment>
        );
      })}
    </StyledSelectedInfoWrapper>
  );
};

export default SelectedPathInfo;
