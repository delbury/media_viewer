import styled from '@emotion/styled';
import { Box, Card, IconButton, ListItemButton, styled as muiStyled, Typography } from '@mui/material';

export const StyledSwitchBtn = muiStyled(IconButton, {
  shouldForwardProp: prop => prop !== 'isWrap',
})<{ isWrap: boolean }>(({ theme, isWrap }) => ({
  padding: 0,
  width: '24px',
  height: '24px',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: theme.palette.grey[400],
  color: theme.palette.grey[400],
  transition: `transform ${theme.transitions.duration.shorter}ms`,
  ...(isWrap
    ? {}
    : {
        transform: 'rotateZ(90deg)',
      }),
}));

export const StyledBtnRow = styled(Box)`
  display: flex;
  align-items: center;
  gap: 12px;
  height: 32px;
`;

export const StyledPathNode = styled(Box)`
  cursor: pointer;
`;

export const StyledPathNodeTitle = styled(Box)`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  ${StyledPathNode}:hover & {
    text-decoration: underline;
    text-underline-offset: 1.5px;
  }
`;

export const StyledHighlightText = muiStyled('span')(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 700,
}));

export const StyledFileCard = styled(Card)`
  padding: 8px;
  width: 100px;
  height: 100px;
  font-size: 1rem;
`;
export const StyledFileName = styled(Box)`
  display: -webkit-box;
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-all;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  font-size: 1rem;
`;
export const StyledFileTitle = styled(Box)`
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 2.4rem;
`;
export const StyledFileMoreInfo = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  & > * {
    line-height: 1.2;
  }
`;

export const StyledListItemButton = styled(ListItemButton)`
  padding: 4px;
`;

export const StyledSelectedInfoWrapper = styled(Box)`
  display: flex;
  column-gap: 4px;
  flex-wrap: wrap;
  max-height: 32px;
`;

export const StyledSelectedInfoName = muiStyled(Typography, {
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

export const StyledPathWrapper = styled(Box, {
  shouldForwardProp: prop => prop !== 'isWrap',
})<{ isWrap?: boolean }>`
  flex: 1;
  display: flex;
  flex-wrap: ${({ isWrap }) => (isWrap ? 'wrap' : 'nowrap')};
  align-items: center;
  padding-bottom: 8px;
  gap: 4px;
`;
