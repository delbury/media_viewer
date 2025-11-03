import RollingText from '#/components/RollingText';
import { useFormatCurrentPath } from '#/hooks/useFileTitle';
import { h5Max } from '#/style/device';
import { formatTime } from '#/utils';
import { MULTIPLE_SYMBOL } from '#/utils/constant';
import { FileInfo } from '#pkgs/apis';
import { SxProps, Theme, useMediaQuery } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import {
  StyledInfoDivider,
  StyledLoopTimes,
  StyledProgressInfo,
  StyledProgressLeft,
  StyledProgressRight,
} from '../style';

interface ProgressInfoProps {
  currentTime: number;
  videoDuration: number;
  loopTimes: number;
  file?: FileInfo;
}

const PATH_TITLE_SX: SxProps<Theme> = {
  fontWeight: 400,
  fontSize: '0.6rem',
  textDecoration: 'none',
  marginRight: 0,
};

const ProgressInfo = ({ currentTime, videoDuration, loopTimes, file }: ProgressInfoProps) => {
  // 当前播放的进度信息，用于展示
  const ct = Math.floor(currentTime);
  const tt = Math.floor(videoDuration);
  const currentInfo = useMemo(() => formatTime(ct, { withHour: tt >= 3600 }), [ct, tt]);
  const totalInfo = useMemo(() => formatTime(tt), [tt]);
  // 是否是 h5
  const isH5 = useMediaQuery(h5Max);
  const showLoopTimes = isH5 && loopTimes !== 1;
  // 展示的路径信息
  const pathText = useFormatCurrentPath(file);

  // 是否全屏
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
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
    <StyledProgressInfo variant="body2">
      <StyledProgressLeft>
        {currentInfo}
        <StyledInfoDivider>/</StyledInfoDivider>
        {totalInfo}
        {showLoopTimes && (
          <StyledLoopTimes>
            {MULTIPLE_SYMBOL}
            {loopTimes}
          </StyledLoopTimes>
        )}
      </StyledProgressLeft>
      <StyledProgressRight>
        {isFullScreen && (
          <RollingText
            sx={PATH_TITLE_SX}
            text={pathText}
          />
        )}
      </StyledProgressRight>
    </StyledProgressInfo>
  );
};

export default ProgressInfo;
