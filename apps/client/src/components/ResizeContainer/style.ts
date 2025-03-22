import { Box, styled } from '@mui/material';

export const StyledContainerWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const StyledBarWrapper = styled(Box)(({ theme }) => ({
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

export const StyledContainerItem = styled(Box)`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;
