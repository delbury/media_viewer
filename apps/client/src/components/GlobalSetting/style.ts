import styled from '@emotion/styled';
import { Box } from '@mui/material';

export const StyledSettingContainer = styled(Box)`
  display: flex;
  flex-direction: column;
`;

export const StyledSettingGroupTitle = styled(Box)`
  margin-block: 8px 4px;
  font-size: 14px;
  font-weight: 700;
`;

export const StyledSettingItem = styled(Box)`
  padding-block: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
`;

export const StyledSettingLabel = styled(Box)`
  font-size: 14px;
`;
