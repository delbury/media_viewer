import styled from '@emotion/styled';
import { Box, DialogTitle } from '@mui/material';

export const StyledDialogTitleWrapper = styled(Box)`
  flex: 1;
  min-width: 0;
  height: 48px;
  padding-right: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const StyledDialogTitle = styled(DialogTitle)`
  padding: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1;
  display: block;
`;

export const StyledDialogHeader = styled(Box)`
  display: flex;
  align-items: center;
`;
