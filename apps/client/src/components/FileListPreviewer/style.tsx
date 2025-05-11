import { badgeClasses, Box, styled } from '@mui/material';

export const StyledListPreviewerWrapper = styled(Box)`
  & .${badgeClasses.badge} {
    right: -4px;
    top: -4px;
    padding: 4px;
    background-color: ${({ theme }) => theme.palette.grey[600]};
    color: ${({ theme }) => theme.palette.common.white};
    font-size: 0.6rem;
    height: 16px;
    min-width: 16px;
    transform: unset;
    line-height: 1;
    border: 2px solid ${({ theme }) => theme.palette.common.black};
  }
`;
