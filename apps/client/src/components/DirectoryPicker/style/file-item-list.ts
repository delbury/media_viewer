import { h5Max } from '#/style/device';
import { Box, styled, ToggleButtonGroup } from '@mui/material';

export const StyledFileToolRow = styled(Box)`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
`;

export const StyledFileInfoRow = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
  color: ${({ theme }) => theme.palette.text.secondary};

  @media ${h5Max} {
    font-size: 0.75rem;
  }
`;

export const StyledFileCountGroup = styled(Box)`
  display: flex;
  gap: 8px;
`;

export const StyledFileCount = styled(Box, {
  shouldForwardProp: prop => prop !== 'clickable',
})<{ clickable: boolean }>`
  display: flex;
  align-items: center;
  line-height: 1;
  border-bottom: 1px solid transparent;
  user-select: none;
  ${({ theme, clickable }) => (clickable ? theme.palette.primary.light : theme.palette.divider)};
  ${({ clickable, theme }) =>
    clickable
      ? `
        color: ${theme.palette.primary.light};
        cursor: pointer;
        border-bottom-color: currentColor;
        :hover {
          color: ${theme.palette.primary.main};
        }
        `
      : ''}
`;

export const FILE_GRID_SIZE = {
  gap: 8,
  gapH5: 4,
  padding: 4,
  minWidth: 90,
};
export const StyledFileGrid = styled(Box)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(${FILE_GRID_SIZE.minWidth}px, 1fr));
  gap: ${FILE_GRID_SIZE.gap}px;
  padding: ${FILE_GRID_SIZE.padding}px;
  & > * {
    aspect-ratio: 1;
  }

  @media ${h5Max} {
    gap: ${FILE_GRID_SIZE.gapH5}px;
  }
`;

export const StyledToggleButtonGroup = styled(ToggleButtonGroup)`
  height: 20px;
  display: flex;
  /* align-self: flex-start; */
`;

export const StyledFileCoverWrapper = styled(Box)`
  position: relative;
  flex: 1;
  min-height: 0;
  word-break: break-all;
`;
