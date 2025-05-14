import { FileInfo } from '#pkgs/apis';
import { Divider } from '@mui/material';
import { useTranslations } from 'next-intl';
import { StyledSelectedDirInfo, StyledSelectedDirInfoWrapper } from '../style';

interface SelectedDirInfoProps {
  files: FileInfo[];
}

const SelectedDirInfo = ({ files }: SelectedDirInfoProps) => {
  const t = useTranslations();

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
