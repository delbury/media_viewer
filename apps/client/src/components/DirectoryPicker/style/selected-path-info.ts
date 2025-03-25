import { Box, styled, Typography } from '@mui/material';

export const StyledSelectedInfoWrapper = styled(Box)`
  display: flex;
  column-gap: 4px;
  flex-wrap: wrap;
  max-height: 32px;
`;
export const StyledSelectedInfoName = styled(Typography, {
  shouldForwardProp: prop => prop !== 'isLast',
})<{ isLast?: boolean }>`
  display: inline-block;
  max-width: ${({ isLast }) => (isLast ? '100%' : '100px')};
  ${({ isLast }) => (isLast ? 'font-weight: 700;' : '')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ theme, isLast }) => (isLast ? theme.palette.primary.main : theme.palette.text.primary)};
`;
