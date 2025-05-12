import { badgeClasses, Box, styled } from '@mui/material';

export const FILE_ITEM_ROW_HEIGHT = 48;

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

export const StyleFilesContainer = styled(Box)`
  height: 65dvh;
`;

export const StyledChildItem = styled(Box)`
  height: ${FILE_ITEM_ROW_HEIGHT}px;
  padding: 4px;
  display: flex;
  align-items: center;
  gap: 12px;

  :hover {
    background-color: ${({ theme }) => theme.palette.action.hover};
  }
`;

export const StyleChildItemImage = styled(Box)`
  height: 100%;
  aspect-ratio: 16 / 9;
  background-color: ${({ theme }) => theme.palette.common.black};
  text-align: center;

  > img {
    height: 100%;
    object-fit: contain;
  }
`;

export const StyleChildItemName = styled(Box)`
  text-overflow: ellipsis;
  overflow: hidden;
  font-size: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-all;
`;
