import { h5Max } from '#/style/device';
import styled from '@emotion/styled';
import { Box, Slider, sliderClasses } from '@mui/material';

export const StyledWrapper = styled(Box)`
  width: 100%;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const StyledSliderContainer = styled(Box)`
  padding-top: 8px;
  padding-inline: 8px;
  flex: 1;
`;

export const StyledSlider = styled(Slider)`
  padding: 0 !important;

  @media (pointer: coarse) {
    // 强制覆盖原有样式
    padding: 0 !important;
  }

  .${sliderClasses.thumb}.${sliderClasses.active} {
    box-shadow: 0px 0px 0px 4px rgba(var(--mui-palette-primary-mainChannel) / 0.16) !important;
  }

  .${sliderClasses.markLabel} {
    top: 8px !important;
    font-size: 12px;
    color: ${({ theme }) => theme.palette.text.secondary};

    @media ${h5Max} {
      font-size: 10px;
    }
  }
`;
