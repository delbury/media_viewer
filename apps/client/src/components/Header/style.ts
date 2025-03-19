'use client';

import { Box } from '@mui/material';
import styled from '@emotion/styled';

export const HeaderWrapper = styled(Box)`
  display: flex;
  gap: 24px;
  align-items: center;
  height: 48px;
  padding: 0 24px;
  font-size: 0;
  background-color: var(--color-bg-dark);

  * {
    font-size: 32px;
    color: var(--color-text-light);
  }
`;
