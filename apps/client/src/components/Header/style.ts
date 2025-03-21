'use client';

import styled from '@emotion/styled';
import { Box } from '@mui/material';

export const StyledHeaderWrapper = styled(Box)`
  display: flex;
  gap: 24px;
  align-items: center;
  height: 48px;
  padding: 0 24px;
  font-size: 0;
  background-color: var(--color-bg-dark);

  * {
    font-size: 2.5rem;
    color: var(--color-text-light);
  }
`;
