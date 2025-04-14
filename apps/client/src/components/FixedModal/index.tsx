import { useShortcut } from '#/hooks/useShortcut';
import { stopPropagation } from '#/utils';
import { CloseRounded } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { createPortal } from 'react-dom';
import { StyledFixedContent, StyledFixedModalToolbar, StyledFixedModalWrapper } from './style';

export interface FixedModalProps {
  visible?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
  // 点击空白处关闭
  closeWhenClickBlank?: boolean;
}

const FixedModal = ({ children, visible, onClose, closeWhenClickBlank }: FixedModalProps) => {
  useShortcut({
    onEscPressed: onClose,
  });

  return (
    !!visible &&
    createPortal(
      <StyledFixedModalWrapper
        onClick={ev => {
          stopPropagation(ev);
          if (closeWhenClickBlank) onClose?.();
        }}
      >
        <StyledFixedModalToolbar>
          <IconButton
            color="inherit"
            size="large"
            onClick={ev => {
              stopPropagation(ev);
              onClose?.();
            }}
          >
            <CloseRounded fontSize="large" />
          </IconButton>
        </StyledFixedModalToolbar>

        <StyledFixedContent>{children}</StyledFixedContent>
      </StyledFixedModalWrapper>,
      document.body
    )
  );
};

export default FixedModal;
