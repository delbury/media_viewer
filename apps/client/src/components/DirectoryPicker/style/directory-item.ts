import styled from '@emotion/styled';
import { Box, IconButton, iconButtonClasses, ListItem, ListItemButton } from '@mui/material';

export const StyledListItem = styled(ListItem)`
  padding: 4px;
  gap: 12px;
`;

export const StyledListItemButton = styled(ListItemButton)`
  padding: 0;
`;

export const StyledSubIcon = styled(Box)`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  right: 0;
  bottom: 0;
  width: 55%;
  height: 55%;
  pointer-events: none;
  background-color: ${({ theme }) => theme.palette.common.white};
  border-radius: 50%;
  border: 0.05em solid ${({ theme }) => theme.palette.common.white};

  > svg {
    width: 100%;
    height: 100%;
  }
`;

export const StyleIconBtn = styled(IconButton)`
  padding: 0;
  position: relative;

  &.${iconButtonClasses.root} {
    color: ${({ theme }) => theme.palette.primary.light};
  }
  &.${iconButtonClasses.disabled} {
    color: ${({ theme }) => theme.palette.text.disabled};
  }
`;
