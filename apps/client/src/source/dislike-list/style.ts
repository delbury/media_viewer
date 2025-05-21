import { Box, styled } from '@mui/material';

export const StyledDislikeListWrapper = styled(Box)`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const StyledDirs = styled(Box)`
  max-height: 20dvh;
  overflow: hidden;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;

export const StyledDirItem = styled(Box, {
  shouldForwardProp: prop => prop !== 'selected',
})<{ selected?: boolean }>`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  font-size: 0.875rem;
  cursor: pointer;
  text-underline-offset: 2px;

  color: ${({ theme, selected }) =>
    selected ? theme.palette.primary.light : theme.palette.text.secondary};

  ${({ selected }) => (selected ? 'text-decoration: underline' : '')};

  :hover {
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
