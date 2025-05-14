import { DirectoryInfo } from '#pkgs/apis';
import { getAllFiles } from '#pkgs/tools/common';
import { Divider } from '@mui/material';
import { useMemo } from 'react';
import { StyledSelectedDirInfo, StyledSelectedDirInfoWrapper } from '../style';

interface SelectedDirInfoProps {
  dir?: DirectoryInfo;
}

const SelectedDirInfo = ({ dir }: SelectedDirInfoProps) => {
  const files = useMemo(() => (dir ? getAllFiles('video', dir) : []), [dir]);

  return (
    <StyledSelectedDirInfoWrapper>
      <StyledSelectedDirInfo>{files.length}</StyledSelectedDirInfo>
      <Divider />
    </StyledSelectedDirInfoWrapper>
  );
};

export default SelectedDirInfo;
