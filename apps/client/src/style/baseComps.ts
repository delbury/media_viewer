import { Box, styled } from '@mui/material';

export const StyleBaseLineClamp = styled(Box, {
  shouldForwardProp: prop => prop !== 'lineClamp',
})<{ lineClamp?: number }>`
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-all;
  display: -webkit-box;
  -webkit-line-clamp: ${({ lineClamp }) => lineClamp ?? 1};
  -webkit-box-orient: vertical;
`;
