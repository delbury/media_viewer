import { StyleBaseLineClamp } from '#/style/baseComps';
import {
  badgeClasses,
  Box,
  Card,
  CardHeader,
  cardHeaderClasses,
  chipClasses,
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
  display: flex;
  justify-content: space-between;
  align-items: center;

  & .${chipClasses.label} {
    font-size: 0.75rem;
  }
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

  && * {
    color: ${({ theme }) => theme.palette.common.white};
  }

  & .${cardHeaderClasses.subheader} {
    font-size: 0.75rem;
  }

  & .${cardHeaderClasses.content} {
    cursor: pointer;
    :hover * {
      color: ${({ theme }) => theme.palette.info.dark};
    }
  }

  & .${badgeClasses.badge} {
    padding: 4px;
    font-size: 0.6rem;
    height: 16px;
    min-width: 16px;
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
  width: 72px;
  height: 72px;
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
  margin-inline-start: 8px;
  font-size: 0.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  word-break: break-all;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

export const StyledShortDir = styled(Box)`
  margin-top: 4px;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

export const StyledBtnContainer = styled(Box)`
  display: flex;
  gap: 8px;
`;

export const StyledNameRow = styled(StyleBaseLineClamp)`
  line-height: 1.1;
`;
