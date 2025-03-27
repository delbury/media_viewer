import { Box, styled } from '@mui/material';

export const StyledEmptyWrapper = styled(Box)`
  margin: auto 0;
  height: 100%;
  min-height: 100px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const StyledEmptyTip = styled(Box)`
  color: ${({ theme }) => theme.palette.text.secondary};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;
