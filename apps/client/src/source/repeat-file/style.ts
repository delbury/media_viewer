import { Box, styled } from '@mui/material';

export const StyledRepeatFileWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const StyledSelectedDirInfoWrapper = styled(Box)`
  margin: 8px 0;
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;

export const StyledSelectedDirInfo = styled(Box)`
  height: 100%;
  display: flex;
  justify-content: space-between;
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 0.8rem;

  > * {
    height: 100%;
    display: flex;
  }
`;

export const StyledFileGroupBtn = styled('span', {
  shouldForwardProp: prop => prop !== 'selected',
})<{
  selected?: boolean;
}>`
  display: flex;
  height: calc(100% + 1px);
  align-items: center;
  cursor: pointer;
  margin-bottom: -1px;
  border-bottom: 2px solid transparent;

  :not(:last-child) {
    margin-inline-end: 12px;
  }

  ${({ selected, theme }) =>
    selected
      ? `
      border-bottom-color: currentColor;
      color: ${theme.palette.primary.light};
      `
      : ''}
`;

export const StyledFileContentContainer = styled(Box)`
  flex: 1;
  min-height: 0;
`;

export const StyledFileExtraInfoWrapper = styled(Box)`
  display: flex;
  justify-content: space-between;
  font-size: 0.6rem;
  line-height: 1;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

export const StyledFileExtraInfoItem = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 2px;

  :nth-child(1),
  :nth-child(2) {
    flex: 1 0 3.2rem;
  }

  :nth-child(3) {
    flex: 1 0 2.5rem;
    align-items: flex-end;
  }

  :nth-child(4) {
    flex: 1 0 4.2rem;
    align-items: flex-end;
  }
`;
