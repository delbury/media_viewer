import { CANCEL_MODAL_Z_INDEX } from '#/style/constant';
import { Box, styled } from '@mui/material';

export const CancelAreaWrapper = styled(Box, {
  shouldForwardProp: prop => prop !== 'activated' && prop !== 'disabled',
})<{ activated: boolean; disabled?: boolean }>`
  position: fixed;
  inset: 0;
  margin: auto;
  z-index: ${CANCEL_MODAL_Z_INDEX};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60dvw;
  height: 20dvw;
  border-radius: 8px;
  touch-action: none;
  backdrop-filter: blur(2px);

  color: ${({ theme, disabled }) =>
    disabled ? theme.palette.grey[600] : theme.palette.common.white};

  background-color: ${({ theme, activated }) =>
    (activated ? theme.palette.grey[400] : theme.palette.grey[800]) + '80'};
`;
