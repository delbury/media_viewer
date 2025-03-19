import { Box, styled } from '@mui/material';

export const ScrollBox = styled(Box)`
  overflow-y: auto;
  background-clip: content-box;
`;

export const ContainerWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
`;

export const BarWrapper = styled(Box)(({ theme }) => ({
  position: 'absolute',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  cursor: 'ns-resize',
  backgroundColor: theme.palette.action.hover,

  ':hover': {
    backgroundColor: theme.palette.action.selected,
  },
}));
