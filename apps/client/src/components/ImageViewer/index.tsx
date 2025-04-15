import { useDrag } from '#/hooks/useDrag';
import { useGesture } from '#/hooks/useGesture';
import { UserZoomParams, useZoom } from '#/hooks/useZoom';
import { getFileSourceUrl, preventDefault } from '#/utils';
import { FileInfo } from '#pkgs/apis';
import { AutorenewRounded, ZoomInRounded, ZoomOutRounded } from '@mui/icons-material';
import { IconButton } from '@mui/material';
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
};
// 缩放限制
const SCALE_LIMIT = {
  max: 5,
  min: 0.75,
  step: 0.2,
};

type ImageViewerProps = {
  file: FileInfo;
} & Omit<FixedModalProps, 'children'>;

const ImageViewer = ({ visible, onClose, file }: ImageViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const sourceUrl = useMemo(() => getFileSourceUrl(file), [file]);
  const imageRef = useRef<HTMLImageElement>(null);
  // 偏移值，用于拖拽
  const [offset, setOffset] = useState(INIT_STATE.offset);
  // 缩放值，用于缩放
  const [scale, setScale] = useState(INIT_STATE.scale);

  // 图片位置、缩放、旋转样式
  const imageStyle = useMemo<CSSProperties>(() => {
    const dx = offset[0] / scale;
    const dy = offset[1] / scale;
    return {
      transform: `scale(${scale}) translate(${dx}px, ${dy}px)`,
    };
  }, [offset, scale]);

  // 禁用图片过渡动画
  const disableTrisition = useCallback(() => {
    imageRef.current?.style.setProperty('transition', 'none', 'important');
  }, [imageRef]);

  // 启用图片过渡动画
  const enableTrisition = useCallback(() => {
    window.setTimeout(() => {
      imageRef.current?.style.removeProperty('transition');
    }, 100);
  }, [imageRef]);

  // 判断手势
  const { detectGesture } = useGesture();

  // 拖拽 hook
  const { dragEventHandler, reset } = useDrag({
    callback: setOffset,
    onStart: disableTrisition,
    onEnd: enableTrisition,
  });

  // 缩放至
  const zoomTo = useCallback(
    (nv: number) => {
      if (nv > SCALE_LIMIT.max) nv = SCALE_LIMIT.max;
      else if (nv < SCALE_LIMIT.min) nv = SCALE_LIMIT.min;

      setScale(nv);
    },
    [setScale]
  );

  // 缩放间隔
  const zoomBy = useCallback(
    (diff: number) => {
      setScale(v => {
        const nv = v + diff;
        if (nv > SCALE_LIMIT.max) return SCALE_LIMIT.max;
        if (nv < SCALE_LIMIT.min) return SCALE_LIMIT.min;
        return nv;
      });
    },
    [setScale]
  );

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
    (startPos, diffScale) => {
      zoomTo(diffScale * scale);
    },
    [scale, zoomTo]
  );

  // zoom 手势
  const { zoomEventHandler } = useZoom({
    onStart: disableTrisition,
    onEnd: enableTrisition,
    callback: handleZoomCallback,
  });

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
  }, []);

  // 点击操作
  const handlePointerDown = useCallback<PointerEventHandler<HTMLElement>>(
    async ev => {
      // 当触摸开始时一段时间内命中了某个手势操作后，则不进入 drag 操作
      const pointers = await detectGesture(ev);
      // 未完成手势，跳过
      if (!pointers) return;
      // 单指操作，进入 drag 操作
      if (pointers.length === 1) dragEventHandler(ev);
      // 双指操作，进入 zoom 操作
      if (pointers.length === 2) zoomEventHandler(pointers);
    },
    [detectGesture, dragEventHandler, zoomEventHandler]
  );

  // 重置
  const handleReset = useCallback(() => {
    setOffset(INIT_STATE.offset);
    setScale(INIT_STATE.scale);
    reset();
  }, [setOffset, reset]);

  return (
    <FixedModal
      visible={visible}
      onClose={onClose}
    >
      <StyledImageWrapper onContextMenu={preventDefault}>
        {sourceUrl && (
          <img
            ref={imageRef}
            src={sourceUrl}
            alt={file.name}
            onError={() => {
              setIsLoading(false);
            }}
            onLoad={() => {
              setIsLoading(false);
            }}
            style={imageStyle}
            onPointerDown={handlePointerDown}
          />
        )}

        {isLoading && (
          <StyledLoadingWrapper>
            <Loading />
          </StyledLoadingWrapper>
        )}
      </StyledImageWrapper>

      {/* 工具栏 */}
      <StyledImageToolbar>
        {/* 缩小 */}
        <IconButton onClick={handleZoomOut}>
          <ZoomOutRounded />
        </IconButton>
        {/* 放大 */}
        <IconButton onClick={handleZoomIn}>
          <ZoomInRounded />
        </IconButton>
        {/* 重置 */}
        <IconButton onClick={handleReset}>
          <AutorenewRounded />
        </IconButton>
      </StyledImageToolbar>
    </FixedModal>
  );
};

export default ImageViewer;
