import { h5Max } from '#/style/device';
import { formatTime } from '#/utils';
import { MULTIPLE_SYMBOL } from '#/utils/constant';
import { useMediaQuery } from '@mui/material';
import { useMemo } from 'react';
import { StyledInfoDivider, StyledLoopTimes, StyledProgressInfo } from '../style';

interface ProgressInfoProps {
  currentTime: number;
  videoDuration: number;
  loopTimes: number;
}

const ProgressInfo = ({ currentTime, videoDuration, loopTimes }: ProgressInfoProps) => {
  // 当前播放的进度信息，用于展示
  const ct = Math.floor(currentTime);
  const tt = Math.floor(videoDuration);
  const currentInfo = useMemo(() => formatTime(ct, { withHour: tt >= 3600 }), [ct, tt]);
  const totalInfo = useMemo(() => formatTime(tt), [tt]);
  // 是否是 h5
  const isH5 = useMediaQuery(h5Max);
  const showLoopTimes = isH5 && loopTimes !== 1;

  return (
    <StyledProgressInfo variant="body2">
      {currentInfo}
      <StyledInfoDivider>/</StyledInfoDivider>
      {totalInfo}
      {showLoopTimes && (
        <StyledLoopTimes>
          {MULTIPLE_SYMBOL}
          {loopTimes}
        </StyledLoopTimes>
      )}
    </StyledProgressInfo>
  );
};

export default ProgressInfo;
