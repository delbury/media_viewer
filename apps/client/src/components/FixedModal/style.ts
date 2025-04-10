import { Box, styled } from '@mui/material';

export const StyledFixedModalWrapper = styled(Box)`
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 3000;
  background-color: rgba(0, 0, 0, 0.6);
  color: ${({ theme }) => theme.palette.common.white};
`;

export const StyledFixedModalToolbar = styled(Box)`
  position: absolute;
  right: 0;
  top: 0;
`;
