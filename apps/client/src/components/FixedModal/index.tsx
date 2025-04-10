import { useShortcut } from '#/hooks/useShortcut';
import { stopPropagation } from '#/utils';
import { CloseRounded } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { createPortal } from 'react-dom';
import { StyledFixedModalToolbar, StyledFixedModalWrapper } from './style';

export interface FixedModalProps {
  visible?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
}

const FixedModal = ({ children, visible, onClose }: FixedModalProps) => {
  useShortcut({
    onEscPressed: onClose,
  });

  return (
    !!visible &&
    createPortal(
      <StyledFixedModalWrapper onClick={stopPropagation}>
        <StyledFixedModalToolbar>
          <IconButton
            color="inherit"
            size="large"
            onClick={onClose}
          >
            <CloseRounded fontSize="large" />
          </IconButton>
        </StyledFixedModalToolbar>

        {children}
      </StyledFixedModalWrapper>,
      document.body
    )
  );
};

export default FixedModal;
