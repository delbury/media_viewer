import styled from '@emotion/styled';
import { Box } from '@mui/material';

export const StyledContentWrapper = styled(Box)`
  height: 100%;
  width: 100%;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  row-gap: 24px;

  > audio {
    width: 100%;
    max-width: 600px;
  }
`;

export const StyledImgContainer = styled(Box)`
  position: relative;
  width: 100%;
  max-width: 250px;
  max-height: 250px;
  aspect-ratio: 1;

  > img {
    height: 100%;
    width: 100%;
    object-fit: contain;
  }
`;

const CONTENT_HEIGHT_PERCENT = 32;
export const StyledLyricArea = styled(Box)`
  position: relative;
  height: ${CONTENT_HEIGHT_PERCENT}dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  overflow: hidden;
`;

export const StyledLyricContent = styled(Box)`
  padding: ${CONTENT_HEIGHT_PERCENT / 2}dvh 0;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: none;
`;

export const StyledScrollRecover = styled(Box)`
  position: absolute;
  bottom: 0;
  left: 24px;
  right: 24px;
  text-align: center;

  > button {
    color: ${({ theme }) => theme.palette.grey[200]};
    background-color: ${({ theme }) => theme.palette.grey[200] + '80'};
    backdrop-filter: blur(2px);
    padding: 4px 16px;
    border-radius: 12px;
  }
`;

export const StyledLyricRow = styled(Box, {
  shouldForwardProp: prop => prop !== 'isActivated',
})<{ isActivated?: boolean }>`
  margin-bottom: 2em;
  padding: 0 24px;
  text-align: center;

  ${({ isActivated, theme }) =>
    isActivated
      ? `
        transform: scale(1.2);
        font-weight: 700;
        color: ${theme.palette.primary.light};
      `
      : ''}
`;

export const StyledCoverBtnWrapper = styled(Box)`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  > * {
    color: ${({ theme }) => theme.palette.common.white} !important;
    transition: opacity ${({ theme }) => theme.transitions.duration.shorter}ms;
  }
  > button {
    opacity: 0;
  }
  :hover > button {
    opacity: 1;
  }
`;
