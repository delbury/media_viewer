import { Box, styled, tooltipClasses } from '@mui/material';

// 控件相关
export const StyledSettingTooltipWrapper = styled(Box)`
  position: relative;

  && .${tooltipClasses.tooltip} {
    margin: 0 0 12px !important;
    padding: 0 !important;
    font-size: 0.875rem !important;
  }
`;
