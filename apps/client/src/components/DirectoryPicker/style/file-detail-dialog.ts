import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledFileDetailWrapper = styled(Box)`
  display: grid;
  grid-template-columns: minmax(6em, 2fr) 5fr;
  column-gap: 1em;
  row-gap: 4px;
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

export const StyledFilePosterWrapper = styled(Box)`
  position: relative;
  margin-top: 8px;
  width: 100%;
  padding-top: 56.25%;
`;

export const StyledFilePosterInner = styled(Box)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;
