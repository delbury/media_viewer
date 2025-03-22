import { Box, styled } from '@mui/material';

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
  color: theme.palette.text.secondary,

  ':hover': {
    backgroundColor: theme.palette.action.selected,
  },
}));

export const ContainerItem = styled(Box)`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;
