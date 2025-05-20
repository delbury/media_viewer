import { Box, styled } from '@mui/material';

export const StyledDislikeListWrapper = styled(Box)`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const StyledDirs = styled(Box)`
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;

export const StyledDirItem = styled(Box)`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.palette.text.secondary};
  cursor: pointer;

  :hover {
    color: ${({ theme }) => theme.palette.text.primary};
    text-decoration: underline;
  }

  > * {
    display: flex;
    align-items: center;
  }
`;

export const StyledContent = styled(Box)`
  flex: 1;
  min-height: 0;
`;
