import { Box, styled } from '@mui/material';

export const StyledVideoWrapper = styled(Box)`
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0;

  > video {
    width: 100%;
    height: 100%;
    max-width: fit-content;
    max-height: fit-content;
    object-fit: contain;
  }
`;
