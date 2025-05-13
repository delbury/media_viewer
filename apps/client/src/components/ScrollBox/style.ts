import { h5Max } from '#/style/device';
import styled from '@emotion/styled';
import { Box } from '@mui/material';

export const StyledScrollBoxWrapper = styled(Box)`
  position: relative;
  overflow: hidden;
`;

export const StyledScrollBoxContent = styled(Box, {
  shouldForwardProp: prop => prop !== 'hideScrollbar',
})<{ hideScrollbar?: boolean }>`
  height: 100%;
  overflow: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  scrollbar-width: ${({ hideScrollbar }) => (hideScrollbar ? 'none' : 'auto')};

  @media ${h5Max} {
    scrollbar-width: ${({ hideScrollbar }) => (hideScrollbar ? 'none' : 'thin')};
  }
`;

const BAR_SIZE = 12;
const SHADOW_OFFSET = 4;
export type BarPosition = 'top' | 'bottom' | 'left' | 'right';
export const StyledScrollFloatTipBar = styled(Box, {
  shouldForwardProp: prop => prop !== 'barPosition',
})<{ barPosition: BarPosition }>(({ theme: { palette }, barPosition }) => {
  const isTop = barPosition === 'top';
  const isBottom = barPosition === 'bottom';
  const isLeft = barPosition === 'left';
  const isRight = barPosition === 'right';

  const top = !isBottom ? 0 : void 0;
  const bottom = !isTop ? 0 : void 0;
  const left = !isRight ? 0 : void 0;
  const right = !isLeft ? 0 : void 0;

  const height = isTop || isBottom ? BAR_SIZE : void 0;
  const width = isLeft || isRight ? BAR_SIZE : void 0;

  const gradientDir = isTop ? 'bottom' : isBottom ? 'top' : isLeft ? 'right' : 'left';
  const boxShadowX = isTop ? SHADOW_OFFSET : isBottom ? -SHADOW_OFFSET : 0;
  const boxShadowY = isLeft ? SHADOW_OFFSET : isRight ? -SHADOW_OFFSET : 0;
  return {
    position: 'absolute',
    zIndex: 0,
    left,
    right,
    height,
    width,
    top,
    bottom,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: palette.text.secondary,
    cursor: 'pointer',
    // pointerEvents: 'none',

    '::before': {
      position: 'absolute',
      zIndex: -1,
      content: '""',
      display: 'block',
      width: '100%',
      height: '100%',
      // backgroundColor: palette.grey[100],
      backgroundImage: `linear-gradient(to ${gradientDir}, ${palette.grey[200]}, ${palette.grey[100]}aa)`,
      boxShadow: `${boxShadowX}px ${boxShadowY}px 16px ${palette.grey[200]}`,
    },

    '&:hover::before': {
      backgroundImage: `linear-gradient(to ${gradientDir}, ${palette.grey[400]}, ${palette.grey[200]}aa)`,
    },
  };
});

export const StyledEmptyWrapper = styled(Box)`
  position: absolute;
  inset: 0;
  margin: auto;
`;
