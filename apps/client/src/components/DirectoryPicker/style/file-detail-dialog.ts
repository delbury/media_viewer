import { DEFAULT_RATIO } from '#pkgs/tools/common';
import { Box, Tab, Tabs } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledContentContainer = styled(Box)`
  width: 100%;
  height: 60vh;
`;

export const StyledFileDetailWrapper = styled(Box)`
  display: grid;
  grid-template-columns: minmax(6em, 2fr) 5fr;
  column-gap: 1em;
  row-gap: 4px;
`;

export const StyledFileDetailLabel = styled(Box)`
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  white-space: nowrap;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

export const StyledFileDetailValue = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  word-break: break-all;
`;

export const StyledFilePosterWrapper = styled(Box)`
  position: relative;
  margin-top: 24px;
  width: 100%;
  padding-top: ${DEFAULT_RATIO * 100}%;
`;

export const StyledFilePosterInner = styled(Box)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

export const StyledTabs = styled(Tabs)`
  min-height: unset;
  margin-bottom: 12px;
`;

export const StyledTab = styled(Tab)`
  padding: 8px 12px;
  min-height: unset;
`;

export const StyledJsonContainer = styled(Box)`
  font-family: 'Courier New', monospace;
  padding: 12px;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: ${({ theme }) => theme.palette.common.black};
  color: ${({ theme }) => theme.palette.common.white};
  scrollbar-width: thin;
`;
