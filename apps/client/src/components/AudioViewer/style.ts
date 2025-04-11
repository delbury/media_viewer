import { Box, styled } from '@mui/material';

export const StyledAudioWrapper = styled(Box)`
  height: 100%;
  width: 100%;
  padding: 0 24px;
  display: flex;
  justify-content: center;
  align-items: center;

  > audio {
    width: 100%;
  }
`;
