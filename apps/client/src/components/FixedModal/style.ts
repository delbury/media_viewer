import { h5Max } from '#/style/device';
import { FIXED_MODAL_Z_INDEX } from '#/utils/constant';
import { Box, buttonBaseClasses, iconButtonClasses, styled, svgIconClasses } from '@mui/material';

export const StyledFixedModalWrapper = styled(Box)`
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: ${FIXED_MODAL_Z_INDEX};
  background-color: rgba(0, 0, 0, 0.85);
  color: ${({ theme }) => theme.palette.common.white};
  display: flex;
  flex-direction: column;
`;

export const StyledFixedModalHeader = styled(Box)`
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  @media ${h5Max} {
    flex-direction: row-reverse;
  }

  & .${iconButtonClasses.root} {
    color: inherit;
  }
`;

export const StyledFixedTitle = styled(Box)`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
`;

export const StyledFixedToolbar = styled(Box)`
  & .${iconButtonClasses.root} {
    color: ${({ theme }) => theme.palette.grey[600]};
    &:hover {
      color: ${({ theme }) => theme.palette.common.white};
    }
  }

  & .${svgIconClasses.root} {
    font-size: 2rem;
  }
`;

export const StyledFixedContent = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`;

export const StyledFooterWrapper = styled(Box)`
  z-index: 1;

  & .${buttonBaseClasses.root} {
    color: inherit;
    padding: 4px;
  }

  && .${buttonBaseClasses.disabled} {
    color: ${({ theme }) => theme.palette.grey[700]};
  }
`;
