import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { StyledHighlightText, StyledTitleRightWrapper } from '../style/current-files-info';

interface CurrentFilesInfoProps {
  totalFiles: number;
  selfFiles: number;
  selfDirectories: number;
}

const CurrentFilesInfo = ({ totalFiles, selfFiles, selfDirectories }: CurrentFilesInfoProps) => {
  const t = useTranslations();

  return (
    <StyledTitleRightWrapper>
      <Typography variant="body2">
        {`${t('Tools.SelfDirectories')}${t(':')}`}
        <StyledHighlightText>{selfDirectories}</StyledHighlightText>
      </Typography>

      <Box>
        <Typography variant="body2">
          {`${t('Tools.SelfFiles')}${t(':')}`}
          <StyledHighlightText>{selfFiles}</StyledHighlightText>
        </Typography>

        <Typography variant="body2">{`${t(',')}`}</Typography>

        <Typography variant="body2">
          {`${t('Tools.TotalFiles')}${t(':')}`}
          <StyledHighlightText>{totalFiles}</StyledHighlightText>
        </Typography>
      </Box>
    </StyledTitleRightWrapper>
  );
};

export default CurrentFilesInfo;
