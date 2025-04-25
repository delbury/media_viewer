import { useShortcut } from '#/hooks/useShortcut';
import { stopPropagation } from '#/utils';
import { CloseRounded } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { createPortal } from 'react-dom';
import RollingText from '../RollingText';
import {
  StyledFixedContent,
  StyledFixedModalHeader,
  StyledFixedModalWrapper,
  StyledFixedTitle,
  StyledFixedToolbar,
  StyledFooterWrapper,
} from './style';

export interface FixedModalProps {
  visible?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
  // 点击空白处关闭
  closeWhenClickBlank?: boolean;
  title?: string;
  // 放在底部的元素
  footerSlot?: React.ReactNode;
}

const FixedModal = ({
  children,
  visible,
  onClose,
  closeWhenClickBlank,
  title,
  footerSlot,
}: FixedModalProps) => {
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
        <StyledFixedModalHeader>
          <StyledFixedTitle>{title && <RollingText text={title} />}</StyledFixedTitle>

          <StyledFixedToolbar>
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
          </StyledFixedToolbar>
        </StyledFixedModalHeader>

        <StyledFixedContent>{children}</StyledFixedContent>
        <StyledFooterWrapper>{footerSlot}</StyledFooterWrapper>
      </StyledFixedModalWrapper>,
      document.body
    )
  );
};

export default FixedModal;
