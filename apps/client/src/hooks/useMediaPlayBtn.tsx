import { PauseCircleRounded, PlayCircleRounded } from '@mui/icons-material';
import { Box, IconButton, styled, SxProps, Theme } from '@mui/material';
import { DOMAttributes, ReactEventHandler, RefObject, useCallback, useState } from 'react';

const StyledWrapper = styled(Box)`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  > * {
    color: ${({ theme }) => theme.palette.common.white} !important;
    opacity: 0;
    pointer-events: none;
    transition: opacity ${({ theme }) => theme.transitions.duration.shorter}ms;
  }
  :hover > * {
    opacity: 1;
    pointer-events: all;
  }
`;

const iconSx: SxProps<Theme> = {
  width: '75%',
  height: '75%',
};

interface UseMediaPlayBtn {
  mediaRef: RefObject<HTMLAudioElement | null>;
  // 不需要按钮组件
  noBtn?: boolean;
}

export const useMediaPlayBtn = ({ mediaRef, noBtn }: UseMediaPlayBtn) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleToggle = useCallback(() => {
    if (!mediaRef.current) return;
    if (mediaRef.current.paused) {
      mediaRef.current.play();
    } else {
      mediaRef.current.pause();
    }
  }, [mediaRef]);

  const handlePlay = useCallback<ReactEventHandler<HTMLVideoElement>>(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback<ReactEventHandler<HTMLVideoElement>>(() => {
    setIsPlaying(false);
  }, []);

  const MediaBtn = useCallback(
    ({ sx }: { sx?: SxProps<Theme> }) => {
      if (noBtn) {
        return null;
      }
      return (
        <StyledWrapper>
          <IconButton
            onClick={handleToggle}
            sx={sx}
          >
            {isPlaying ? <PlayCircleRounded sx={iconSx} /> : <PauseCircleRounded sx={iconSx} />}
          </IconButton>
        </StyledWrapper>
      );
    },
    [handleToggle, isPlaying, noBtn]
  );

  return {
    MediaBtn,
    isPlaying,
    toggle: handleToggle,
    events: {
      onPlay: handlePlay,
      onPause: handlePause,
    } as Pick<DOMAttributes<HTMLVideoElement>, 'onPlay' | 'onPause'>,
  };
};
