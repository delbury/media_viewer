import styled from '@emotion/styled';
import { Box } from '@mui/material';

export const StyledFilePosterIcon = styled(Box)`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

export const StyledFilePosterHover = styled(StyledFilePosterIcon)`
  display: none;
  cursor: pointer;
  opacity: 0.6;
  pointer-events: none;
  background-color: black;
  /* mix-blend-mode: difference; */
`;

export const StyledFilePosterWrapper = styled(Box)`
  position: relative;
  height: 100%;
  width: 100%;
  cursor: pointer;

  :hover ${StyledFilePosterHover} {
    display: flex;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background-color: ${({ theme }) => theme.palette.common.black};
  }
`;
