import { Box, styled } from '@mui/material';

export const StyledRepeatFileWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const StyledSelectedDirInfoWrapper = styled(Box)`
  margin: 8px 0;
`;

export const StyledSelectedDirInfo = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 0.875rem;
`;

export const StyledFileContentContainer = styled(Box)`
  flex: 1;
  min-height: 0;
`;

export const StyledFileExtraInfoWrapper = styled(Box)`
  display: flex;
  justify-content: space-between;
  font-size: 0.6rem;
  line-height: 1;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

export const StyledFileExtraInfoItem = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 4px;

  :nth-child(1),
  :nth-child(2) {
    flex: 1 0 3.2rem;
  }

  :nth-child(3) {
    flex: 1 0 2.5rem;
    align-items: flex-end;
  }

  :nth-child(4) {
    flex: 1 0 4.2rem;
    align-items: flex-end;
  }
`;
