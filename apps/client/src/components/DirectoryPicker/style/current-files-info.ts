import { styled } from '@mui/material';

export const StyledHighlightText = styled('span')(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 700,
}));
