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
  padding: 4px;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: center;
  font-size: 0.875rem;
  cursor: pointer;
  text-underline-offset: 2px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: 4px;

  color: ${({ theme, selected }) =>
    selected ? theme.palette.primary.light : theme.palette.text.secondary};

  ${({ selected }) =>
    selected
      ? `
      text-decoration: underline;
      border-color: currentColor;
      `
      : ''}

  :not(:last-child) {
    margin-bottom: 4px;
  }

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
