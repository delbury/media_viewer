import { EMPTY_SYMBOL } from '#/utils/constant';
import { RepeatRounded } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { RefObject, useCallback, useEffect, useState } from 'react';
import { StyledChildrenWrapper, StyledLoopText } from '../style';
import { bindEvent } from '../util';

/**
 * 大于等于 M 秒的视频，只播放一次
 * 小于 M 秒的视频，播放 n 次
 * 当 n * duration >= M 秒成立时，n 取最小值
 */
const DURATION_M = 20;
const calcAutoLoopTimes = (duration: number) => {
  if (Number.isNaN(duration) || duration >= DURATION_M) return 1;

  const n = Math.ceil(DURATION_M / duration);
  return n || 1;
};

interface LoopSettingProps {
  mediaRef: RefObject<HTMLMediaElement | null>;
  onTimesChange?: (times: number) => void;
  videoDuration: number;
}

/**
 * 循环播放，两种模式
 * 1. 自动计算循环次数
 * 2. 不循环，只播放一次
 */
const LoopSetting = ({ onTimesChange, videoDuration, mediaRef }: LoopSettingProps) => {
  const [currentLoopTimes, setCurrentLoopTimes] = useState(1);
  const [isAuto, setIsAuto] = useState(true);

  useEffect(() => {
    const elm = mediaRef.current;
    if (!elm) return;

    const times = calcAutoLoopTimes(videoDuration);
    setCurrentLoopTimes(times);

    // 设置循环
    const endController = bindEvent(elm, 'ended', () => {
      setCurrentLoopTimes(v => {
        if (v > 1) {
          elm.play();
          return v - 1;
        }
        // 结束循环
        endController.abort();
        return 1;
      });
    });

    // 清除循环
    return () => {
      endController.abort();
    };
  }, [mediaRef, videoDuration]);

  useEffect(() => {
    onTimesChange?.(currentLoopTimes);
  }, [currentLoopTimes, onTimesChange]);

  const handleToggleLoopMode = useCallback(() => {
    setIsAuto(v => !v);
  }, []);

  return (
    <StyledChildrenWrapper>
      <IconButton onClick={handleToggleLoopMode}>
        <RepeatRounded />
      </IconButton>

      <StyledLoopText color="common.white">
        {isAuto ? currentLoopTimes : EMPTY_SYMBOL}
      </StyledLoopText>
    </StyledChildrenWrapper>
  );
};

export default LoopSetting;
