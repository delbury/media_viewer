import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledFileDetailWrapper = styled(Box)`
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 1em;
  row-gap: 4px;
`;

export const StyledFileDetailRow = styled(Box)`
  display: contents;
`;

export const StyledFileDetailLabel = styled(Box)`
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  white-space: nowrap;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

export const StyledFileDetailValue = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  word-break: break-all;
`;
