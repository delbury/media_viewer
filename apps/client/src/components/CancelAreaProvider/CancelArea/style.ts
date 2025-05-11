import { CANCEL_MODAL_Z_INDEX } from '#/style/theme';
import { Box, styled } from '@mui/material';

export const CancelAreaWrapper = styled(Box, {
  shouldForwardProp: prop => prop !== 'activated',
})<{ activated: boolean }>`
  position: fixed;
  inset: 0;
  margin: auto;
  z-index: ${CANCEL_MODAL_Z_INDEX};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60vw;
  aspect-ratio: 3 / 1;
  border-radius: 8px;
  touch-action: none;
  color: ${({ theme }) => theme.palette.common.white};
  background-color: ${({ theme, activated }) =>
    (activated ? theme.palette.grey[400] : theme.palette.grey[800]) + '80'};
  backdrop-filter: blur(2px);
`;
