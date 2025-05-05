import { h5Max } from '#/style/device';
import styled from '@emotion/styled';
import {
  Box,
  buttonBaseClasses,
  linearProgressClasses,
  Slider,
  sliderClasses,
  ToggleButton,
  toggleButtonClasses,
  Typography,
} from '@mui/material';

export const StyledMediaControlsWrapper = styled(Box)`
  position: relative;
  padding: 0 12px 16px;
  width: 100%;
  height: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

// 工具栏相关
export const StyledToolsRow = styled(Box)`
  position: relative;
  width: 100%;

  display: flex;
  align-items: center;
`;
export const StyledBtnsContainer = styled(Box)`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;

  /* @media ${h5Max} {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    > *:nth-child(1) {
      justify-content: flex-start;
    }
    > *:nth-child(2) {
      justify-content: center;
    }
    > *:nth-child(3) {
      justify-content: flex-end;
    }
  } */
`;
export const StyledBtnsGroup = styled(Box)`
  display: flex;
  gap: 12px;

  & .${buttonBaseClasses.root} {
    color: inherit;
    padding: 4px;
  }
  & .${buttonBaseClasses.disabled} {
    color: ${({ theme }) => theme.palette.grey[600]};
  }
`;

// 播放时间/总时间信息
export const StyledProgressInfo = styled(Typography)`
  display: flex;
  font-size: 0.75rem;
  margin-inline-end: 24px;

  @media ${h5Max} {
    position: absolute;
    top: 0;
    transform: translateY(-100%);
    font-size: 0.6rem;
  }
`;
export const StyledInfoDivider = styled(Box)`
  margin: 0 4px;
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
export type NearType = 'left' | 'right' | null;
// 当前游标靠近进度条左侧开始或者右侧结束的最小距离
export const NEAR_EDGE_MIN_DISTANCE = 16;
export const StyleCursorTime = styled(Box, {
  shouldForwardProp: prop => prop !== 'near',
})<{ near: NearType }>`
  position: absolute;
  left: ${({ near }) =>
    near === 'left' ? 'calc(50% + 8px)' : near === 'right' ? 'calc(50% - 12px)' : '50%'};
  width: fit-content;
  height: fit-content;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.palette.common.white};
  transform: translate(-50%, -200%);
  transition: left ${({ theme }) => theme.transitions.duration.shorter}ms;
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

// 音量控件
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

  & .${sliderClasses.root} {
    padding: 0;
  }
  & .${sliderClasses.rail} {
    background-color: ${({ theme }) => theme.palette.common.white};
  }
`;

// 播放速率控件
export const StyledRateText = styled(Box)`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.palette.common.black};
  font-size: 0.55rem;
  font-weight: 700;
  pointer-events: none;
`;
export const StyledRateOption = styled(ToggleButton)`
  text-transform: none;
`;
export const StyledChildrenWrapper = styled(Box)`
  position: relative;
`;

// 视频旋转控件
export const StyledRotateText = styled(StyledRateText)`
  color: ${({ theme }) => theme.palette.common.white};
`;

// Tooltip 包裹容器
export const StyledToggleBtnPopoverContainer = styled(Box)`
  && .${toggleButtonClasses.selected} {
    color: ${({ theme }) => theme.palette.primary.light};
  }
`;

// 提示信息悬浮框
export const StyledFloatAlertInfo = styled(Box)`
  width: 120px;
  position: absolute;
  top: 0;
  transform: translateY(calc(-100% - 24px));
  font-size: 0.8rem;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  padding: 12px 24px;
  border-radius: 4px;
  text-align: center;
`;
