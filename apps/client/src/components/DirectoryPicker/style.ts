import { Box, Theme, styled as muiStyled } from '@mui/material';
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
