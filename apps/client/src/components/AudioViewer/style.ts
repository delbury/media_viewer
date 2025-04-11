import { Box, styled } from '@mui/material';

export const StyledContentWrapper = styled(Box)`
  height: 100%;
  width: 100%;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  row-gap: 24px;

  > audio {
    width: 100%;
    max-width: 600px;
  }
`;

export const StyledImgContainer = styled(Box)`
  width: 100%;
  max-width: 400px;
  max-height: 400px;

  > img {
    height: 100%;
    width: 100%;
    object-fit: contain;
  }
`;

export const StyledFileName = styled(Box)`
  width: 100%;
  /* white-space: nowrap; */
  text-overflow: ellipsis;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
`;
