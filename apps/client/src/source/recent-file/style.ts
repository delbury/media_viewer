import {
  Box,
  Card,
  CardHeader,
  cardHeaderClasses,
  List,
  ListItem,
  ListItemText,
  styled,
} from '@mui/material';

export const StyledRecentFileWrapper = styled(Box)`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const StyledToolsRow = styled(Box)`
  margin-bottom: 12px;
`;

export const StyledContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const StyledContent = styled(Card)``;

export const StyledCardHeader = styled(CardHeader)`
  padding: 8px;
  padding-bottom: 4px;
  background-color: ${({ theme }) => theme.palette.grey[600]};
  cursor: pointer;

  && * {
    color: ${({ theme }) => theme.palette.common.white};
  }

  :hover * {
    color: ${({ theme }) => theme.palette.info.dark};
  }

  & .${cardHeaderClasses.subheader} {
    font-size: 0.75rem;
  }
`;

export const StyledCreatedTime = styled('span')`
  font-weight: 700;
  margin-inline-end: 8px;
  color: ${({ theme }) => theme.palette.primary.light};
`;

export const StyledList = styled(List)`
  padding-top: 4px;
`;

export const StyledImgContainer = styled(Box)`
  width: 48px;
  height: 48px;
  background-color: ${({ theme }) => theme.palette.common.black};

  > img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

export const StyledListItem = styled(ListItem)`
  padding: 2px 8px;
  cursor: pointer;

  :hover {
    background-color: ${({ theme }) => theme.palette.action.hover};
  }
`;

export const StyledListItemText = styled(ListItemText)`
  font-size: 0.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  word-break: break-all;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;
