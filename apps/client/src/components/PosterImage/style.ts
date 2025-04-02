import { Box, styled } from '@mui/material';

export const StyledFilePosterWrapper = styled(Box)`
  position: relative;
  height: 100%;
  width: 100%;
  /* cursor: pointer; */
`;

export const StyledFilePosterLoading = styled(Box)`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;
