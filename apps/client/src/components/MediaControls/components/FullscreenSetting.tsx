import { RootType } from '#/components/FixedModal';
import { FullscreenExitRounded, FullscreenRounded } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { RefObject, useCallback, useEffect, useState } from 'react';

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
      setIsFullScreen(false);
    } else {
      let curElm: HTMLElement | null = mediaRef.current;
      while (curElm) {
        if (curElm.dataset.root === RootType.Media) break;
        curElm = curElm.parentElement;
      }
      if (!curElm) return;
      curElm.requestFullscreen();
      setIsFullScreen(true);
    }
  }, [mediaRef, setIsFullScreen]);

  useEffect(() => {
    setDisabled(!document.fullscreenEnabled);
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
