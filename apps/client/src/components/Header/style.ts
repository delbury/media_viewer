'use client';

import { HEADER_HEIGHT } from '#/style/constant';
import styled from '@emotion/styled';
import { Box } from '@mui/material';

export const StyledHeaderWrapper = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: ${HEADER_HEIGHT}px;
  padding: 0 16px;
  font-size: 0;
  background-color: var(--color-bg-dark);
`;

export const StyledHeaderLinkGroup = styled(Box)`
  display: flex;
  gap: 24px;
  align-items: center;
  font-size: 0;

  svg {
    font-size: 24px;
    color: var(--color-text-light);
  }
`;
