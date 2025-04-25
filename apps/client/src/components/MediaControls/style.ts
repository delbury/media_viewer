import { Box, styled } from '@mui/material';

export const StyledMediaControlsWrapper = styled(Box)`
  padding-bottom: 24px;
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

export const StyledProgressContainer = styled(Box)`
  padding: 0 24px;
  width: 100%;
  cursor: pointer;

  &:hover {
    transform: scaleY(1.5);
  }

  /* 已播放的进度条 */
  .MuiLinearProgress-bar1 {
    transition: none;
    background-color: ${({ theme }) => theme.palette.primary.light};
  }

  /* 已缓存的进度条颜色 */
  .MuiLinearProgress-bar2 {
    background-color: unset;
  }

  /* 未加载的进度条颜色 */
  .MuiLinearProgress-dashed {
    animation: none;
    background-image: none;
    background-color: ${({ theme }) => theme.palette.grey[800]};
  }
`;
