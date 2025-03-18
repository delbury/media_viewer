import { Box, styled } from '@mui/material';
import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles({
  ol: {
    rowGap: '8px',
  },
});

export const PathBtn = styled(Box)`
  cursor: pointer;

  &:hover * {
    text-decoration: underline;
    text-underline-offset: 1.5px;
  }
`;
