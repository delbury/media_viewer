import styled from '@emotion/styled';
import {
  Box,
  linearProgressClasses,
  Slider,
  sliderClasses,
  tooltipClasses,
  Typography,
} from '@mui/material';

export const StyledMediaControlsWrapper = styled(Box)`
  padding: 0 24px 16px;
  width: 100%;
  height: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

// 工具栏相关、
export const StyledToolsRow = styled(Box)`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
`;
export const StyledBtnsGroup = styled(Box)`
  display: flex;
  gap: 8px;

  button {
    color: inherit;
  }
`;

// 游标相关
export const StyledCursorContainer = styled(Box)`
  /* display: none; */
  position: absolute;
  top: 10px;
  left: 0;
  color: ${({ theme }) => theme.palette.primary.light};
  pointer-events: none;

  & > svg {
    position: absolute;
    left: -12px;
    width: 24px;
    height: 24px;

    :first-of-type {
      bottom: -4px;
    }

    :last-of-type {
      top: -4px;
    }
  }
`;
export const StyleCursorTime = styled(Box)`
  position: absolute;
  left: 0;
  left: 50%;
  width: fit-content;
  height: fit-content;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.palette.common.white};
  transform: translate(-50%, -200%);
`;

// 进度条相关
export const StyledProgressContainer = styled(Box)`
  position: relative;
  margin-bottom: 12px;
  /* margin: -8px 0; */
  padding: 8px 0;
  width: 100%;
  font-size: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: none;

  &:hover .${linearProgressClasses.root} {
    transform: scaleY(1.5);
  }

  & .${linearProgressClasses.root} {
    pointer-events: none;
  }

  /* 已播放的进度条 */
  & .${linearProgressClasses.bar1} {
    transition: none;
    background-color: ${({ theme }) => theme.palette.primary.light};
  }

  /* 已缓存的进度条颜色 */
  & .${linearProgressClasses.bar2} {
    background-color: unset;
    transition: all 200ms;
  }

  /* 未加载的进度条颜色 */
  & .${linearProgressClasses.dashed} {
    animation: none;
    background-image: none;
    background-color: ${({ theme }) => theme.palette.grey[800]};
  }
`;
export const StyledProgressInfo = styled(Typography)`
  font-size: 0.75rem;
`;

// 音量控件相关
export const StyledVolumeTooltipWrapper = styled(Box)`
  position: relative;

  && .${tooltipClasses.tooltip} {
    margin: 0 0 12px !important;
    padding: 0 !important;
    font-size: 0.875rem !important;
  }
`;
export const StyledVolumePopoverContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 120px;
  padding: 8px 0;

  > span {
    margin-bottom: 8px;
  }
`;
export const StyledSlider = styled(Slider)`
  color: ${({ theme }) => theme.palette.primary.light};

  & .${sliderClasses.rail} {
    background-color: ${({ theme }) => theme.palette.common.white};
  }
`;
