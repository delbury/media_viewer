import { Box, Card, ListItemButton, styled as muiStyled } from '@mui/material';
import { makeStyles } from '@mui/styles';
import styled from '@emotion/styled';

export const useStyles = makeStyles({
  ol: {
    rowGap: '8px',
  },
});

export const PathNodeWrapper = styled(Box)`
  cursor: pointer;
`;

export const PathNodeTitle = styled(Box)`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  ${PathNodeWrapper}:hover & {
    text-decoration: underline;
    text-underline-offset: 1.5px;
  }
`;

export const HighlightText = muiStyled('span')(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 700,
}));

export const StyledFileCard = styled(Card)`
  padding: 8px;
  width: 100px;
  height: 100px;
  font-size: 1rem;
`;
export const StyledFileTitle = styled(Box)`
  display: -webkit-box;
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-all;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  font-size: 1rem;
`;
export const StyledFileExt = styled(Box)`
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1.2rem;
`;

export const StyledListItemButton = styled(ListItemButton)`
  padding: 4px;
`;
