import { DirectoryInfo } from '#pkgs/apis';
import { getAllFiles } from '#pkgs/tools/common';
import { Divider } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { StyledSelectedDirInfo, StyledSelectedDirInfoWrapper } from '../style';

interface SelectedDirInfoProps {
  dir?: DirectoryInfo;
}

const SelectedDirInfo = ({ dir }: SelectedDirInfoProps) => {
  const t = useTranslations();
  const files = useMemo(() => {
    const list = dir ? getAllFiles('video', dir) : [];
    return list;
  }, [dir]);

  return (
    <StyledSelectedDirInfoWrapper>
      <StyledSelectedDirInfo>
        {t('Common.Video')}
        {t(':')}
        {files.length}
      </StyledSelectedDirInfo>
      <Divider />
    </StyledSelectedDirInfoWrapper>
  );
};

export default SelectedDirInfo;
