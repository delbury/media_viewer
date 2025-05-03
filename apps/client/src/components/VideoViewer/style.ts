import styled from '@emotion/styled';
import { Box } from '@mui/material';

export const StyledVideoWrapper = styled(Box)`
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0;
  min-height: 0;

  > video {
    width: 100%;
    height: 100%;
    max-width: fit-content;
    max-height: fit-content;
    object-fit: contain;
    transition-property: transform, height, width;
    transition-duration: ${({ theme }) => theme.transitions.duration.shorter}ms;
    cursor: pointer;
    touch-action: none;
    -webkit-tap-highlight-color: transparent;
  }
`;

export const StyledLoadingWrapper = styled(Box)`
  position: absolute;
  margin: auto;
  height: 250px;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;
