'use client';

import styled from '@emotion/styled';
import { Box } from '@mui/material';

export const StyledHeaderWrapper = styled(Box)`
  display: flex;
  gap: 24px;
  align-items: center;
  height: 40px;
  padding: 0 24px;
  font-size: 0;
  background-color: var(--color-bg-dark);

  svg {
    font-size: 24px;
    color: var(--color-text-light);
  }
`;
