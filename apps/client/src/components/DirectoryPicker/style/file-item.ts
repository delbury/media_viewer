import { h5Max } from '#/style/device';
import { Box, Card, styled, Typography } from '@mui/material';

export const StyledFileCardWrapper = styled(Card)`
  padding: 8px;
  font-size: 1rem;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
`;
export const StyledFileMoreInfo = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;
export const StyledFileMoreInfoExt = styled(Typography)`
  line-height: 1.2;
  font-size: 0.8rem;
  text-transform: uppercase;

  @media ${h5Max} {
    font-size: 0.5rem;
  }
`;
export const StyledFileMoreInfoSize = styled(StyledFileMoreInfoExt)`
  line-height: 1.2;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.palette.text.secondary};

  @media ${h5Max} {
    font-size: 0.5rem;
  }
`;
export const StyledFileName = styled(Box)`
  display: -webkit-box;
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-all;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.2;
  font-size: 0.8rem;

  @media ${h5Max} {
    font-size: 0.5rem;
  }
`;
export const StyledFileTitle = styled(Box)`
  margin-bottom: 4px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  column-gap: 0.2rem;
  cursor: pointer;
  &:hover * {
    color: ${({ theme }) => theme.palette.primary.main};
  }
`;
