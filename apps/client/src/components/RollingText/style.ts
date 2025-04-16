import { Box, styled } from '@mui/material';

export const StyledTextWrapper = styled(Box)`
  width: 100%;
  overflow: hidden;
  text-align: center;
`;

export const StyledTextContent = styled(Box)`
  margin: 0 auto;
  white-space: nowrap;
  width: fit-content;
  font-weight: 700;
  font-size: 1.125rem;
  text-decoration: underline;
  text-underline-offset: 4px;
`;
