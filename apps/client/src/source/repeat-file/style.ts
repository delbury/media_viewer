import { Box, styled } from '@mui/material';

export const StyledRepeatFileWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const StyledSelectedDirInfoWrapper = styled(Box)`
  margin: 8px 0;
`;

export const StyledSelectedDirInfo = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 0.8rem;
`;

export const StyledFileGroupBtn = styled('span', {
  shouldForwardProp: prop => prop !== 'selected',
})<{
  selected?: boolean;
}>`
  cursor: pointer;

  ${({ selected, theme }) =>
    selected
      ? `
      text-decoration: underline;
      text-underline-offset: 4px;
      text-decoration-thickness: 1px;
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
  gap: 4px;

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
