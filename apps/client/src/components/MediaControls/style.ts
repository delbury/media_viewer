import styled from '@emotion/styled';
import { Box } from '@mui/material';

export const StyledMediaControlsWrapper = styled(Box)`
  padding: 0 24px 16px;
  width: 100%;
  height: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

export const StyledBtnsGroup = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  > button {
    color: inherit;
  }
`;

export const StyledCursorContainer = styled(Box)`
  display: none;
  position: absolute;
  top: 10px;
  left: -12px;
  color: ${({ theme }) => theme.palette.primary.light};
  pointer-events: none;

  & > * {
    position: absolute;
    left: 0;
    width: 24px;
    height: 24px;

    :first-child {
      bottom: -4px;
    }

    :last-child {
      top: -4px;
    }
  }
`;

export const StyledProgressContainer = styled(Box)`
  position: relative;
  margin-bottom: 12px;
  /* margin: -8px 0; */
  padding: 8px 0;
  width: 100%;
  font-size: 0;
  cursor: pointer;

  &:hover {
    ${StyledCursorContainer} {
      display: block;
    }

    .MuiLinearProgress-root {
      transform: scaleY(1.5);
    }
  }

  /* 已播放的进度条 */
  .MuiLinearProgress-bar1 {
    transition: none;
    background-color: ${({ theme }) => theme.palette.primary.light};
  }

  /* 已缓存的进度条颜色 */
  .MuiLinearProgress-bar2 {
    background-color: unset;
    transition: all 200ms;
  }

  /* 未加载的进度条颜色 */
  .MuiLinearProgress-dashed {
    animation: none;
    background-image: none;
    background-color: ${({ theme }) => theme.palette.grey[800]};
  }
`;
