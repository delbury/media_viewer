import { h5Max } from '@/style/device';
import { Box, IconButton, styled, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';

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

export const StyledFileToolRow = styled(Box)`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
`;

export const StyledFileResetBtn = styled(IconButton)`
  /* margin-right: 12px; */
  padding: 0;
  font-size: 0;
`;

export const StyledFileCountInfo = styled(Typography)`
  margin-top: 0.2em;
  color: ${({ theme }) => theme.palette.text.secondary};
  text-align: right;

  @media ${h5Max} {
    font-size: 0.6rem;
  }
`;

export const StyledFileGrid = styled(Box)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 4px;
  padding: 4px;
  & > * {
    aspect-ratio: 1;
  }
`;

export const StyledToggleButtonGroup = styled(ToggleButtonGroup)`
  height: 20px;
  display: flex;
`;

export const StyledFilePosterWrapper = styled(Box)`
  flex: 1;
  min-height: 0;
`;
