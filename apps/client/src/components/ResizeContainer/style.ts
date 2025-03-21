import { Box, styled } from '@mui/material';

export const ScrollBox = styled(Box)`
  flex: 1;
  overflow-y: auto;
  background-clip: content-box;
  /* border: 1px solid var(--mui-palette-divider); */
  /* border-radius: 8px; */
`;

export const ContainerWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 8px;
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

export const ContainerItem = styled(Box)`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;
