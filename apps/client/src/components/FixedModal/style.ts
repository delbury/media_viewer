import { Box, styled } from '@mui/material';

export const StyledFixedModalWrapper = styled(Box)`
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 3000;
  background-color: rgba(0, 0, 0, 0.85);
  color: ${({ theme }) => theme.palette.common.white};
  display: flex;
  flex-direction: column;
`;

export const StyledFixedModalToolbar = styled(Box)`
  /* position: absolute; */
  /* right: 0; */
  /* top: 0; */
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;

  & > * {
    color: ${({ theme }) => theme.palette.grey[600]};
    &:hover {
      color: ${({ theme }) => theme.palette.common.white};
    }
  }
`;

export const StyledFixedContent = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1;
`;
