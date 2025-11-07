import { Box, styled } from '@mui/material';

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
  gap: 2px;

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
