import sty from '@emotion/styled';
import { Box, styled } from '@mui/material';

export const StyledPathNode = sty(Box)`
  cursor: pointer;
`;

export const StyledPathNodeTitle = sty(Box)`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  ${StyledPathNode}:hover & {
    text-decoration-line: underline;
    text-underline-offset: 1.5px;
  }
`;

export const StyledPathWrapper = styled(Box, {
  shouldForwardProp: prop => prop !== 'isWrap',
})<{ isWrap?: boolean }>`
  flex: 1;
  display: flex;
  flex-wrap: ${({ isWrap }) => (isWrap ? 'wrap' : 'nowrap')};
  align-items: center;
  gap: 4px;
`;

export const StyledCountTag = styled('span')`
  margin-inline-start: 0.5em;
  text-decoration-line: underline;
  text-underline-offset: 1.5px;
  text-decoration-style: dotted;
`;
