import { Box, styled } from '@mui/material';

export const StyledContentWrapper = styled(Box)`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export const StyledVideoWrapper = styled(Box)`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0;

  > video {
    width: 100%;
    height: fit-content;
    object-fit: contain;
  }
`;
