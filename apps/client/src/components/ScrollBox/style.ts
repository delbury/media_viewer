import { Box, styled } from '@mui/material';

export const StyledScrollBoxWrapper = styled(Box)`
  position: relative;
  overflow: hidden;
`;

export const StyledScrollBoxContent = styled(Box)`
  height: 100%;
  overflow: auto;
`;

export const StyledScrollFloatTipBar = styled(Box, {
  shouldForwardProp: prop => !['isAtTop', 'isAtBottom'].includes(prop as string),
})<{ isAtTop?: boolean; isAtBottom?: boolean }>(({ theme: { palette }, isAtBottom, isAtTop }) => ({
  position: 'absolute',
  zIndex: 0,
  left: 0,
  right: 0,
  height: 12,
  top: isAtTop ? 0 : void 0,
  bottom: isAtBottom ? 0 : void 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: palette.text.secondary,
  pointerEvents: 'none',

  '::before': {
    position: 'absolute',
    zIndex: -1,
    content: '""',
    display: 'block',
    width: '100%',
    height: '100%',
    // backgroundColor: palette.grey[100],
    backgroundImage: `linear-gradient(to ${isAtTop ? 'bottom' : 'top'}, ${palette.grey[200]}, ${palette.grey[100]}aa)`,
    boxShadow: `0 ${isAtTop ? '' : '-'}4px 16px ${palette.grey[200]}`,
  },
}));
