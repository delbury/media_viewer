import { h5Max } from '#/style/device';
import { Box, styled } from '@mui/material';

export const StyledHighlightText = styled('span')(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 700,
}));

export const StyledTitleRightWrapper = styled(Box)`
  line-height: 1;
  text-align: right;
  color: ${({ theme }) => theme.palette.text.secondary};

  @media ${h5Max} {
    & * {
      font-size: 0.75rem;
    }
  }
`;
