import { Box, IconButton, styled } from '@mui/material';

export const StyledSwitchBtnWrapper = styled(Box)`
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  overflow: hidden;
`;
export const StyledSwitchBtn = styled(IconButton, {
  shouldForwardProp: prop => prop !== 'isWrap',
})<{ isWrap: boolean }>(({ theme, isWrap }) => ({
  padding: 0,
  width: '100%',
  height: '100%',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: theme.palette.grey[400],
  color: theme.palette.grey[400],
  transition: `transform ${theme.transitions.duration.shorter}ms`,
  ...(isWrap
    ? {}
    : {
        transform: 'rotateZ(90deg)',
      }),
}));
