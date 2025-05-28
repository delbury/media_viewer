import { EMPTY_SYMBOL } from '#/utils/constant';
import { RepeatRounded } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { StyledChildrenWrapper, StyledLoopText } from '../style';
import { bindEvent } from '../util';

// 临近播放结束或开始的阈值时间
const NEAR_EDGE = 0.5;
// 如果时长小于，则使用百分比阈值
const NEAR_MAX_DURATION = 1;
const NEAR_PERCENT = 0.4;
const calcNearEdge = (currentTime: number, duration: number, paused: boolean) => {
  const res = {
    nearStart: false,
    nearEnd: false,
  };
  if (paused) {
    return res;
  }

  if (duration <= NEAR_MAX_DURATION) {
    res.nearStart = currentTime / duration < NEAR_PERCENT;
    res.nearEnd = (duration - currentTime) / duration <= NEAR_EDGE;
  } else {
    res.nearStart = currentTime <= NEAR_EDGE;
    res.nearEnd = duration - currentTime <= NEAR_EDGE;
  }
  return res;
};

/**
 * 大于等于 M 秒的视频，只播放一次
 * 小于 M 秒的视频，播放 n 次
 * 当 n * duration >= M 秒成立时，n 取最小值
 */
const DURATION_M = 12;
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
  const isNearEnd = useRef(false);

  useEffect(() => {
    const elm = mediaRef.current;
    if (!elm) return;

    const times = calcAutoLoopTimes(videoDuration);
    setCurrentLoopTimes(times);

    // 设置循环
    elm.loop = times > 1;
    isNearEnd.current = false;
    if (!elm.loop) return;

    // 因为设置了 loop 后 ended 事件不再触发
    // 监听播放时间改变事件，模拟 ended 事件
    const controller = bindEvent(elm, 'timeupdate', () => {
      const { nearStart, nearEnd } = calcNearEdge(elm.currentTime, videoDuration, elm.paused);
      // 当临近结束时，为播放状态，则标记
      if (nearEnd) {
        isNearEnd.current = nearEnd;
      } else if (nearStart) {
        // 重新开始播放
        if (isNearEnd.current) {
          // 完成一次循环播放
          isNearEnd.current = false;
          setCurrentLoopTimes(v => {
            if (v > 2) return v - 1;
            // 结束循环
            elm.loop = false;
            controller.abort();
            return v - 1;
          });
        }
      }
    });

    // 清除循环
    return () => {
      elm.loop = false;
      controller.abort();
    };
  }, [mediaRef, videoDuration]);

  // 开始加载时初始化
  useEffect(() => {
    const elm = mediaRef.current;
    if (!elm) return;
    const controller = bindEvent(elm, 'loadstart', () => {
      setCurrentLoopTimes(1);
    });
    return () => {
      controller.abort();
    };
  }, [mediaRef]);

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
