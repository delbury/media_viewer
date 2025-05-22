import { FullscreenExitRounded, FullscreenRounded } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { RefObject, useCallback, useEffect, useState } from 'react';
import { findFullscreenRoot } from '../util';

interface FullscreenSettingProps {
  mediaRef: RefObject<HTMLMediaElement | null>;
}

const FullscreenSetting = ({ mediaRef }: FullscreenSettingProps) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [disabled, setDisabled] = useState(false);

  // 全屏切换
  const handleToggleFullScreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      const elm = findFullscreenRoot(mediaRef.current);
      elm?.requestFullscreen();
    }
  }, [mediaRef]);

  useEffect(() => {
    setDisabled(!document.fullscreenEnabled);

    const controller = new AbortController();
    document.addEventListener(
      'fullscreenchange',
      () => {
        setIsFullScreen(!!document.fullscreenElement);
      },
      {
        signal: controller.signal,
      }
    );
    return () => {
      controller.abort();
    };
  }, []);

  return (
    <IconButton
      disabled={disabled}
      onClick={handleToggleFullScreen}
    >
      {isFullScreen ? <FullscreenExitRounded /> : <FullscreenRounded />}
    </IconButton>
  );
};

export default FullscreenSetting;
