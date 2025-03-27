import { Box, ToggleButton } from '@mui/material';

import { styled } from '@mui/material';

export const StyledToggleButton = styled(ToggleButton)`
  position: relative;
  padding: 0 6px;
  white-space: nowrap;
`;

export const StyledSelectedBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  fontSize: '0.75rem',
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.primary.dark,
  color: theme.palette.primary.contrastText,
  opacity: 0.5,
  transform: 'scale(0.75)',
  transformOrigin: 'top right',
}));
