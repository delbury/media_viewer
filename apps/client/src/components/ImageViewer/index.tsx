import { useDrag } from '#/hooks/useDrag';
import { useFileTitle } from '#/hooks/useFileTitle';
import { useGesture } from '#/hooks/useGesture';
import { useResizeObserver } from '#/hooks/useResizeObserver';
import { useRotateState } from '#/hooks/useRotateState';
import { UserZoomParams, useZoom } from '#/hooks/useZoom';
import { h5Max } from '#/style/device';
import { getFileSourceUrl, preventDefault } from '#/utils';
import { FileInfo } from '#pkgs/apis';
import {
  ArrowBackRounded,
  ArrowForwardRounded,
  AutorenewRounded,
  FormatListNumberedRtlRounded,
  RotateLeftRounded,
  RotateRightRounded,
  ShuffleRounded,
  WallpaperRounded,
  ZoomInRounded,
  ZoomOutRounded,
} from '@mui/icons-material';
import { IconButton, useMediaQuery } from '@mui/material';
import {
  CSSProperties,
  PointerEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import FixedModal, { FixedModalProps } from '../FixedModal';
import Loading from '../Loading';
import { StyledImageToolbar, StyledImageWrapper, StyledLoadingWrapper } from './style';

// 初始化值
const INIT_STATE = {
  offset: [0, 0] as [number, number],
  scale: 1,
  degree: 0,
};
// 缩放限制
const SCALE_LIMIT = {
  max: 5,
  min: 0.5,
  step: 0.2,
};

type ImageViewerProps = {
  file?: FileInfo;
  isList?: boolean;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  isRandomPlay?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  onToggleRandom?: () => void;
  onTitleClick?: () => void;
  headerLeftSlot?: React.ReactNode;
} & Omit<FixedModalProps, 'children'>;

const ImageViewer = ({
  visible,
  onClose,
  file,
  nextDisabled,
  prevDisabled,
  isList,
  isRandomPlay,
  onNext,
  onPrev,
  onToggleRandom,
  onTitleClick,
  headerLeftSlot,
}: ImageViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const imageRef = useRef<HTMLImageElement>(null);
  const imageContainerRef = useRef<HTMLElement>(null);
  // 偏移值，用于拖拽
  const [offset, setOffset] = useState(INIT_STATE.offset);
  // 缩放值，用于缩放
  const [scale, setScale] = useState(INIT_STATE.scale);
  // 旋转值，用于旋转
  const { degree, setDegree, enableTransition, disableTransition } = useRotateState({
    defaultDegree: INIT_STATE.degree,
    domRef: imageRef,
  });
  // 监听容器大小改变
  const { size: imageContainerSize } = useResizeObserver({
    domRef: imageContainerRef,
  });

  // 标题
  const { title, secondaryTitle } = useFileTitle({ file });

  // 是否显示 zoom 按钮
  const isH5 = useMediaQuery(h5Max);
  const showZoomBtn = !(isH5 && isList);

  // 加载资源
  const sourceUrl = useMemo(() => getFileSourceUrl(file), [file]);

  // 图片位置、缩放、旋转样式
  const imageStyle = useMemo<CSSProperties>(() => {
    // 旋转 90 度时，需要改变图片容器的大小
    const isVertical = degree % 180 !== 0;

    const dx = offset[0] / scale;
    const dy = offset[1] / scale;
    return {
      transform: `scale(${scale}) translate(${dx}px, ${dy}px) rotate(${degree}deg)`,
      ...(isVertical && imageContainerSize
        ? {
            width: `${imageContainerSize.height}px`,
            height: `${imageContainerSize.width}px`,
          }
        : {}),
    };
  }, [offset, scale, degree, imageContainerSize]);

  // 判断手势
  const { detectGesture } = useGesture();

  // 拖拽 hook
  const { dragEventHandler, resetDragOffset } = useDrag({
    callback: setOffset,
    onStart: disableTransition,
    onEnd: enableTransition,
  });

  // 缩放至
  const zoomTo = useCallback((nv: number) => {
    if (nv > SCALE_LIMIT.max) nv = SCALE_LIMIT.max;
    else if (nv < SCALE_LIMIT.min) nv = SCALE_LIMIT.min;

    setScale(nv);
  }, []);

  // 缩放间隔
  const zoomBy = useCallback((diff: number) => {
    setScale(v => {
      const nv = v + diff;
      if (nv > SCALE_LIMIT.max) return SCALE_LIMIT.max;
      if (nv < SCALE_LIMIT.min) return SCALE_LIMIT.min;
      return nv;
    });
  }, []);

  // 放大
  const handleZoomIn = useCallback(() => {
    zoomBy(+SCALE_LIMIT.step);
  }, [zoomBy]);

  // 缩小
  const handleZoomOut = useCallback(() => {
    zoomBy(-SCALE_LIMIT.step);
  }, [zoomBy]);

  // 手势缩放
  const handleZoomCallback = useCallback<UserZoomParams['callback']>(
    diffScale => {
      zoomTo(diffScale * scale);
    },
    [scale, zoomTo]
  );

  // zoom 手势
  const { zoomEventHandler } = useZoom({
    onStart: disableTransition,
    onEnd: enableTransition,
    callback: handleZoomCallback,
  });

  // 旋转
  const rotateBy = useCallback(
    (deg: number) => {
      const newDeg = deg + degree;

      // 需要重置 offset
      setOffset(INIT_STATE.offset);
      resetDragOffset();
      // 并且计算旋转为 +/-90 时的缩放
      if (newDeg % 180 === 0) {
        // 0 或者 180
        setScale(INIT_STATE.scale);
      } else {
        // 90 或者 -90
        setScale(INIT_STATE.scale);
      }
      // 设置旋转值
      setDegree(newDeg);
    },
    [degree, resetDragOffset, setDegree]
  );

  // 逆时针旋转
  const handleRotateAnticlockwise = useCallback(() => {
    rotateBy(-90);
  }, [rotateBy]);

  // 顺时针旋转
  const handleRotateClockwise = useCallback(() => {
    rotateBy(90);
  }, [rotateBy]);

  useEffect(() => {
    if (imageRef.current) {
      const controller = new AbortController();
      imageRef.current.addEventListener(
        'wheel',
        ev => {
          if (!visible) return;
          if (ev.deltaY > 0) {
            // 向下
            handleZoomOut();
          } else if (ev.deltaY < 0) {
            // 向上
            handleZoomIn();
          }
        },
        { signal: controller.signal }
      );
      return () => {
        controller.abort();
      };
    }
  }, [handleZoomIn, handleZoomOut, visible]);

  // 点击操作
  const handlePointerDown = useCallback<PointerEventHandler<HTMLElement>>(
    async ev => {
      // 当触摸开始时一段时间内命中了某个手势操作后，则不进入 drag 操作
      const gesture = await detectGesture(ev.nativeEvent);
      // 未完成手势，跳过
      if (!gesture) return;
      // 单指操作，进入 drag 操作
      if (gesture.type === 'single-down') dragEventHandler(ev.nativeEvent);
      // 双指操作，进入 zoom 操作
      if (gesture.type === 'double-down') {
        const pointers = Object.fromEntries(
          Object.entries(gesture.pointerInfos).map(it => [it[0], it[1].down])
        );
        zoomEventHandler(pointers);
      }
    },
    [detectGesture, dragEventHandler, zoomEventHandler]
  );
  const handlePointerUp = useCallback<PointerEventHandler<HTMLElement>>(
    ev => {
      detectGesture(ev.nativeEvent);
    },
    [detectGesture]
  );

  // 重置偏移和缩放
  const handleResetOffsetAndScale = useCallback(() => {
    setOffset(INIT_STATE.offset);
    setScale(INIT_STATE.scale);
    resetDragOffset();
  }, [resetDragOffset]);

  // 重置所有
  const handleResetAll = useCallback(() => {
    handleResetOffsetAndScale();
    // 角度重置到 360 的整数倍，从 0 倍开始
    // 当前值靠近哪个就重置到哪个值
    // 0 90 180 270
    const restDegree = degree % 360;
    const resetDegree = degree - restDegree + (restDegree <= 180 ? 0 : 360);
    setDegree(resetDegree);
  }, [degree, handleResetOffsetAndScale, setDegree]);

  const handleNext = useCallback(() => onNext?.(), [onNext]);

  return (
    <FixedModal
      visible={visible}
      onClose={onClose}
      onTitleClick={onTitleClick}
      title={title}
      secondaryTitle={secondaryTitle}
      headerLeftSlot={headerLeftSlot}
      footerSlot={
        // 工具栏
        <StyledImageToolbar>
          {/* 列表模式下隐藏 zoom 按钮，节省空间 */}

          {/* 缩小 */}
          {showZoomBtn && (
            <IconButton onClick={handleZoomOut}>
              <ZoomOutRounded />
            </IconButton>
          )}

          {/* 放大 */}
          {showZoomBtn && (
            <IconButton onClick={handleZoomIn}>
              <ZoomInRounded />
            </IconButton>
          )}

          {/* 播放模式 */}
          {isList && onToggleRandom && (
            <IconButton onClick={onToggleRandom}>
              {isRandomPlay ? <ShuffleRounded /> : <FormatListNumberedRtlRounded />}
            </IconButton>
          )}

          {/* 上一个 */}
          {isList && onPrev && (
            <IconButton
              onClick={onPrev}
              disabled={prevDisabled}
            >
              <ArrowBackRounded />
            </IconButton>
          )}

          {/* 下一个 */}
          {isList && onNext && (
            <IconButton
              onClick={handleNext}
              disabled={nextDisabled}
            >
              <ArrowForwardRounded />
            </IconButton>
          )}

          {/* 只重置缩放和偏移 */}
          <IconButton onClick={handleResetOffsetAndScale}>
            <WallpaperRounded />
          </IconButton>

          {/* 重置所有 */}
          <IconButton onClick={handleResetAll}>
            <AutorenewRounded />
          </IconButton>

          {/* 顺时针旋转 */}
          <IconButton onClick={handleRotateClockwise}>
            <RotateRightRounded />
          </IconButton>

          {/* 逆时针旋转 */}
          <IconButton onClick={handleRotateAnticlockwise}>
            <RotateLeftRounded />
          </IconButton>
        </StyledImageToolbar>
      }
    >
      <StyledImageWrapper
        ref={imageContainerRef}
        onContextMenu={preventDefault}
      >
        {sourceUrl && (
          <img
            ref={imageRef}
            src={sourceUrl}
            alt={title}
            draggable="false"
            onError={() => {
              setIsLoading(false);
            }}
            onLoad={() => {
              setIsLoading(false);
            }}
            style={imageStyle}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            loading="lazy"
          />
        )}

        {isLoading && (
          <StyledLoadingWrapper>
            <Loading />
          </StyledLoadingWrapper>
        )}
      </StyledImageWrapper>
    </FixedModal>
  );
};

export default ImageViewer;
