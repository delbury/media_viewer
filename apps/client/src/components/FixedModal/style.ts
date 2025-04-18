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

export const StyledFixedModalHeader = styled(Box)`
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const StyledFixedTitle = styled(Box)`
  padding: 0 24px;
  flex: 1;
  min-width: 0;
`;

export const StyledFixedToolbar = styled(Box)`
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
  min-height: 0;
`;
