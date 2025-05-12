import { useShortcut } from '#/hooks/useShortcut';
import { stopPropagation } from '#/utils';
import { CloseRounded } from '@mui/icons-material';
import { Box, IconButton, SxProps, Theme } from '@mui/material';
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

export enum RootType {
  Media = 'media',
}

const SUB_TITLE_SX: SxProps<Theme> = {
  textDecoration: 'none',
  fontWeight: 'normal',
  fontSize: '0.8rem',
};

export interface FixedModalProps {
  visible?: boolean;
  onClose?: () => void;
  onTitleClick?: () => void;
  children?: React.ReactNode;
  // 点击空白处关闭
  closeWhenClickBlank?: boolean;
  title?: string;
  secondaryTitle?: string;
  // 放在底部的元素
  footerSlot?: React.ReactNode;
  // 放在 header 左侧的元素
  headerLeftSlot?: React.ReactNode;
}

const FixedModal = ({
  children,
  visible,
  onClose,
  onTitleClick,
  closeWhenClickBlank,
  title,
  secondaryTitle,
  footerSlot,
  headerLeftSlot,
}: FixedModalProps) => {
  useShortcut({
    onEscPressed: onClose,
    eventOption: { stopWhenFirstCalled: true },
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
          <StyledFixedToolbar>{headerLeftSlot}</StyledFixedToolbar>

          <StyledFixedTitle
            onClick={onTitleClick}
            sx={{ cursor: onTitleClick ? 'pointer' : void 0 }}
          >
            <Box>{title && <RollingText text={title} />}</Box>
            <Box>
              {secondaryTitle && (
                <RollingText
                  sx={SUB_TITLE_SX}
                  text={secondaryTitle}
                />
              )}
            </Box>
          </StyledFixedTitle>

          <StyledFixedToolbar>
            <IconButton
              onClick={ev => {
                stopPropagation(ev);
                onClose?.();
              }}
            >
              <CloseRounded />
            </IconButton>
          </StyledFixedToolbar>
        </StyledFixedModalHeader>

        <StyledFixedContent
          // 标记为媒体元素的根元素，用于 video 全屏时选择的元素
          data-root={RootType.Media}
        >
          {children}
          <StyledFooterWrapper>{footerSlot}</StyledFooterWrapper>
        </StyledFixedContent>
      </StyledFixedModalWrapper>,
      document.body
    )
  );
};

export default FixedModal;
