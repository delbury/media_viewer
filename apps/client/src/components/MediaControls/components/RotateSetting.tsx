import TooltipSetting, { TooltipSettingInstance } from '#/components/TooltipSetting';
import { useResizeObserver } from '#/hooks/useResizeObserver';
import { useRotateState } from '#/hooks/useRotateState';
import {
  CachedRounded,
  HdrAutoRounded,
  OndemandVideoRounded,
  RotateRightRounded,
} from '@mui/icons-material';
import { IconButton, ToggleButton, ToggleButtonGroup, ToggleButtonGroupProps } from '@mui/material';
import { isNil } from 'lodash-es';
import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyledChildrenWrapper, StyledRotateText, StyledToggleBtnPopoverContainer } from '../style';
import { bindEvent } from '../util';

interface RotateSettingProps {
  mediaRef: RefObject<HTMLMediaElement | null>;
}

const AUTO_VALUE = 'auto';
const ROTATE_OPTIONS = [0, 90, 180, 270];
// 当宽高比大于该值，触发自动旋转
const AUTO_ROTATE_MIN_ASPECT_RATIO = 1;

const RotateSetting = ({ mediaRef }: RotateSettingProps) => {
  const tooltipSettingRef = useRef<TooltipSettingInstance>(null);

  // 旋转值，用于旋转
  const { degree, setDegree: rawSetDegree } = useRotateState({
    defaultDegree: 0,
    domRef: mediaRef,
  });
  const setDegree = useCallback(
    (newDeg: number) => {
      rawSetDegree(curDeg => {
        // 判断当前的旋转在哪
        const rest = curDeg % 360;
        // 旋转不变
        if (rest === newDeg) return curDeg;
        // 新的旋转角度小于与当前角度的差值
        const diff = newDeg - rest;
        // 如果差值小于等于 180，直接转
        if (Math.abs(diff) <= 180) return curDeg + diff;
        // 否则，差值大于270
        return curDeg + diff + (diff > 0 ? -360 : 360);
      });
    },
    [rawSetDegree]
  );

  // 监听容器大小改变
  const { size: mediaContainerSize } = useResizeObserver({
    domRef: mediaRef,
    findDom: elm => elm.parentElement,
  });

  // 视频旋转
  useEffect(() => {
    const elm = mediaRef.current;
    if (!elm) return;

    // 旋转 90 度时，需要改变图片容器的大小
    const isVertical = degree % 180 !== 0;

    elm.style.setProperty('transform', `rotate(${degree}deg)`);
    if (isVertical && mediaContainerSize) {
      elm.style.setProperty('width', `${mediaContainerSize.height}px`);
      elm.style.setProperty('height', `${mediaContainerSize.width}px`);
    }

    return () => {
      elm.style.removeProperty('transform');
      elm.style.removeProperty('width');
      elm.style.removeProperty('height');
    };
  }, [degree, mediaContainerSize, mediaRef]);

  // 是否自动旋转
  const [auto, setAuto] = useState(false);
  // 当前视频的宽高比
  const [aspectRatio, setAspectRatio] = useState(0);

  const pureDegree = useMemo(() => {
    if (auto) return AUTO_VALUE;

    let val = degree % 360;
    if (val < 0) val += 360;
    return val;
  }, [auto, degree]);

  // 旋转改变
  const handleChange = useCallback<NonNullable<ToggleButtonGroupProps['onChange']>>(
    (ev, val) => {
      if (val === AUTO_VALUE) {
        setAuto(true);
      } else if (!isNil(val)) {
        setDegree(val);
        setAuto(false);
      }
      tooltipSettingRef.current?.close();
    },
    [setDegree]
  );

  // 进入/退出全屏，进入自动旋转模式
  useEffect(() => {
    const controller = new AbortController();
    document.addEventListener(
      'fullscreenchange',
      () => {
        if (document.fullscreenElement) {
          setAuto(true);
        } else {
          setDegree(0);
          setAuto(false);
        }
      },
      {
        signal: controller.signal,
      }
    );
    return () => {
      controller.abort();
    };
  }, [setDegree]);

  // 切换旋转
  // 未旋转 -> 自动旋转，自动旋转 -> 未旋转，手动旋转 -> 未旋转
  const handleToggleRotate = useCallback(() => {
    if (!degree) {
      setAuto(true);
    } else {
      setDegree(0);
      setAuto(false);
    }
  }, [degree, setDegree]);

  // 自动旋转控制
  useEffect(() => {
    if (auto) {
      // 切换到自动旋转
      if (aspectRatio >= AUTO_ROTATE_MIN_ASPECT_RATIO) {
        setDegree(90);
      } else {
        setDegree(0);
      }
    } else {
      // 从自动旋转切换
      setDegree(0);
    }
  }, [aspectRatio, auto, setDegree]);

  // 监听视频的宽高比
  useEffect(() => {
    if (!mediaRef.current) return;

    const controller = bindEvent(mediaRef.current, 'loadeddata', () => {
      const { videoHeight, videoWidth } = mediaRef.current as HTMLVideoElement;

      if (videoHeight && videoWidth) setAspectRatio(videoWidth / videoHeight);
      else setAspectRatio(0);
    });

    return () => {
      controller.abort();
    };
  }, [mediaRef]);

  return (
    <TooltipSetting
      ref={tooltipSettingRef}
      tooltipContent={
        <StyledToggleBtnPopoverContainer>
          <ToggleButtonGroup
            size="small"
            value={pureDegree}
            onChange={handleChange}
            exclusive
          >
            <ToggleButton
              value={AUTO_VALUE}
              key={AUTO_VALUE}
            >
              <HdrAutoRounded />
            </ToggleButton>

            {ROTATE_OPTIONS.map(it => (
              <ToggleButton
                value={it}
                key={it}
                sx={{
                  transform: `rotate(${it}deg)`,
                }}
              >
                <OndemandVideoRounded />
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </StyledToggleBtnPopoverContainer>
      }
    >
      <StyledChildrenWrapper>
        <IconButton onClick={handleToggleRotate}>
          {!auto && !!degree ? <CachedRounded /> : <RotateRightRounded />}
        </IconButton>
        {auto && <StyledRotateText>A</StyledRotateText>}
      </StyledChildrenWrapper>
    </TooltipSetting>
  );
};

export default RotateSetting;
