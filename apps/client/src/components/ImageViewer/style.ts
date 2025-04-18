import { Box, styled } from '@mui/material';

export const StyledImageWrapper = styled(Box)`
  position: relative;
  font-size: 0;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  > img {
    position: absolute;
    width: 100%;
    height: 100%;
    max-width: fit-content;
    max-height: fit-content;
    object-fit: contain;
    transition-property: transform, height, width;
    transition-duration: ${({ theme }) => theme.transitions.duration.shorter}ms;
    touch-action: none;
  }
`;

export const StyledLoadingWrapper = styled(Box)`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

export const StyledImageToolbar = styled(Box)`
  z-index: 1;
  padding-bottom: 24px;
  width: 100%;
  height: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  > button {
    color: inherit;
  }
`;
