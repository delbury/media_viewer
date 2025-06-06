import { StyleBaseLineClamp } from '#/style/baseComps';
import styled from '@emotion/styled';
import { badgeClasses, Box, iconButtonClasses } from '@mui/material';

export const FILE_ITEM_ROW_HEIGHT = 48;

export const StyledListPreviewerWrapper = styled(Box)`
  & .${badgeClasses.badge} {
    right: -4px;
    top: -4px;
    background-color: ${({ theme }) => theme.palette.grey[600]};
    color: ${({ theme }) => theme.palette.common.white};
    padding: 4px;
    font-size: 0.6rem;
    height: 16px;
    min-width: 16px;
    transform: unset;
    line-height: 1;
    border: 2px solid ${({ theme }) => theme.palette.common.black};
  }
`;

export const StyledSlotWrapper = styled(Box)`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.75rem;
`;

export const StyleFilesContainer = styled(Box)`
  height: 65dvh;
  overflow: hidden;
`;

export const StyleChildItemImage = styled(Box)`
  height: 100%;
  /* aspect-ratio: 16 / 9; */
  aspect-ratio: 1;
  background-color: ${({ theme }) => theme.palette.common.black};
  text-align: center;

  > img {
    height: 100%;
    width: 100%;
    object-fit: contain;
  }
`;

export const StyleChildItemInfo = styled(Box)`
  margin-right: 8px;
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: center;
`;

// 删除按钮容器
export const StyleChildItemDelete = styled(Box)`
  & .${iconButtonClasses.root} {
    padding: 2px;
  }
`;

export const StyleChildItemDir = styled(Box)`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  font-size: 0.65rem;
  color: ${({ theme }) => theme.palette.text.secondary};
  line-height: 1;
`;

export const StyleChildItemNameRow = styled(Box)`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

export const StyleChildItemName = styled(StyleBaseLineClamp, {
  shouldForwardProp: prop => prop !== 'lineClamp',
})<{ lineClamp?: number }>`
  line-height: 1;
  font-weight: 700;
  font-size: 0.75rem;
`;

export const StyleChildItemSize = styled(Box)`
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  font-size: 0.75rem;
  min-width: 60px;
`;

export const StyledChildItemInner = styled(Box)`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 4px;
  border: 1px solid transparent;
`;

export const StyledChildItem = styled(Box, { shouldForwardProp: prop => prop !== 'activated' })<{
  type?: 'sibling' | 'activated';
}>`
  height: ${FILE_ITEM_ROW_HEIGHT}px;
  border-top: 2px solid transparent;
  border-bottom: 2px solid transparent;
  border-radius: 4px;
  background-clip: padding-box;

  ${({ type, theme }) =>
    type === 'activated'
      ? `
      background-color: ${theme.palette.info.light};
      `
      : type === 'sibling'
        ? `background-color: ${theme.palette.action.selected};`
        : ''}

  :hover {
    ${StyledChildItemInner} {
      border-color: ${({ theme }) => theme.palette.info.dark};
    }
  }
`;
