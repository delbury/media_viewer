import { useDrag } from '#/hooks/useDrag';
import { useGesture } from '#/hooks/useGesture';
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
  max: 3,
  min: 0.2,
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

  // 判断手势
  const { detectGesture } = useGesture();

  // 拖拽开始
  const handleDragStart = useCallback(() => {
    imageRef.current?.style.setProperty('transition', 'none', 'important');
  }, [imageRef]);

  // 拖拽结束
  const handleDragEnd = useCallback(() => {
    window.setTimeout(() => {
      imageRef.current?.style.removeProperty('transition');
    });
  }, [imageRef]);

  // 拖拽 hook
  const { events, reset } = useDrag({
    callback: setOffset,
    onStart: handleDragStart,
    onEnd: handleDragEnd,
  });

  // 放大
  const handleZoomIn = useCallback(() => {
    setScale(v => {
      const nv = v + SCALE_LIMIT.step;
      if (nv > SCALE_LIMIT.max) return SCALE_LIMIT.max;
      return nv;
    });
  }, [setScale]);

  // 缩小
  const handleZoomOut = useCallback(() => {
    setScale(v => {
      const nv = v - SCALE_LIMIT.step;
      if (nv < SCALE_LIMIT.min) return SCALE_LIMIT.min;
      return nv;
    });
  }, [setScale]);

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
      const pointerIds = await detectGesture(ev);
      // 未完成手势，跳过
      if (!pointerIds) return;
      // 单指操作，进入拖拽
      if (pointerIds.length === 1) events.onPointerDown(ev);
    },
    [events, detectGesture]
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
