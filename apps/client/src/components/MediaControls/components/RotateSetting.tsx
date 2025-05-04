import TooltipSetting, { TooltipSettingInstance } from '#/components/TooltipSetting';
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
  degree: number;
  onDegreeChange: (newVal: number) => void;
}

const AUTO_VALUE = 'auto';
const ROTATE_OPTIONS = [0, 90, 180, 270];
// 当宽高比大于该值，触发自动旋转
const AUTO_ROTATE_MIN_ASPECT_RATIO = 1;

const RotateSetting = ({ degree, onDegreeChange, mediaRef }: RotateSettingProps) => {
  const tooltipSettingRef = useRef<TooltipSettingInstance>(null);

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

  const handleChange = useCallback<NonNullable<ToggleButtonGroupProps['onChange']>>(
    (ev, val) => {
      if (val === AUTO_VALUE) {
        setAuto(true);
      } else if (!isNil(val)) {
        onDegreeChange(val);
        setAuto(false);
      }
      tooltipSettingRef.current?.close();
    },
    [onDegreeChange]
  );

  // 切换旋转
  // 未旋转 -> 自动旋转，自动旋转 -> 未旋转，手动旋转 -> 未旋转
  const handleToggleRotate = useCallback(() => {
    setAuto(v => !v);
  }, []);

  // 自动旋转控制
  useEffect(() => {
    if (auto) {
      // 切换到自动旋转
      if (aspectRatio >= AUTO_ROTATE_MIN_ASPECT_RATIO) {
        onDegreeChange(90);
      } else {
        onDegreeChange(0);
      }
    } else {
      // 从自动旋转切换
      onDegreeChange(0);
    }
  }, [aspectRatio, auto, onDegreeChange]);

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
          {auto ? <RotateRightRounded /> : <CachedRounded />}
        </IconButton>
        {auto && <StyledRotateText>A</StyledRotateText>}
      </StyledChildrenWrapper>
    </TooltipSetting>
  );
};

export default RotateSetting;
