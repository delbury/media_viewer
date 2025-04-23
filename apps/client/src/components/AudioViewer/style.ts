import { Box, styled } from '@mui/material';

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

export const StyledLyricArea = styled(Box)`
  position: relative;
  height: 20vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  overflow: hidden;
`;

export const StyledLyricContent = styled(Box)`
  padding: 10vh 0;
  overflow: auto;
  scrollbar-width: none;
`;

export const StyledScrollRecover = styled(Box)`
  position: absolute;
  bottom: 0;
  left: 24px;
  right: 24px;
  text-align: center;

  > button {
    color: ${({ theme }) => theme.palette.common.black};
    background-color: ${({ theme }) => theme.palette.grey[200]};
    padding: 8px 16px;
    border-radius: 12px;
  }
`;

export const StyledLyricRow = styled(Box, {
  shouldForwardProp: prop => prop !== 'isActived',
})<{ isActived?: boolean }>`
  margin-bottom: 2em;
  padding: 0 24px;
  text-align: center;

  ${({ isActived }) =>
    isActived
      ? `
        transform: scale(1.1);
        font-weight: 700;
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
    opacity: 0;
    pointer-events: none;
    transition: opacity ${({ theme }) => theme.transitions.duration.shorter}ms;
  }
  :hover > * {
    opacity: 1;
    pointer-events: all;
  }
`;
