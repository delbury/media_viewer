import { formatTime } from '#/utils';
import { useMemo } from 'react';
import { StyledInfoDivider, StyledProgressInfo } from '../style';

interface ProgressInfoProps {
  currentTime: number;
  videoDuration: number;
}

const ProgressInfo = ({ currentTime, videoDuration }: ProgressInfoProps) => {
  // 当前播放的进度信息，用于展示
  const ct = Math.floor(currentTime);
  const tt = Math.floor(videoDuration);
  const currentInfo = useMemo(() => formatTime(ct, { withHour: tt >= 3600 }), [ct, tt]);
  const totalInfo = useMemo(() => formatTime(tt), [tt]);

  return (
    <StyledProgressInfo variant="body2">
      {currentInfo}
      <StyledInfoDivider>/</StyledInfoDivider>
      {totalInfo}
    </StyledProgressInfo>
  );
};

export default ProgressInfo;
