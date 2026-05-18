import { styled } from '@mui/material/styles';

export const StyledPathDirLabel = styled('span', {
  shouldForwardProp: prop => prop !== 'highlight',
})<{ highlight?: boolean }>`
  color: ${({ theme, highlight }) => (highlight ? theme.palette.primary.light : '')};
`;
