import styled from '@emotion/styled';
import { Box, Card, ListItemButton, styled as muiStyled, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles({
  ol: {
    rowGap: '8px',
  },
});

export const StyledBtnRow = styled(Box)`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const StyledPathNodeWrapper = styled(Box)`
  cursor: pointer;
`;

export const StyledPathNodeTitle = styled(Box)`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  ${StyledPathNodeWrapper}:hover & {
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

export const StyledSelectedInfoWrapper = styled(Box)`
  display: flex;
  column-gap: 4px;
  flex-wrap: wrap;
`;

export const StyledSelectedInfoName = styled(Typography)`
  display: inline-block;
  max-width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
