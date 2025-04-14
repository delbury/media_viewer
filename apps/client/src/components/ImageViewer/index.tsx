import { useDrag } from '#/hooks/useDrag';
import { getFileSourceUrl } from '#/utils';
import { FileInfo } from '#pkgs/apis';
import { AutorenewRounded, ZoomInRounded, ZoomOutRounded } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { CSSProperties, useCallback, useMemo, useRef, useState } from 'react';
import FixedModal, { FixedModalProps } from '../FixedModal';
import Loading from '../Loading';
import { StyledImageToolbar, StyledImageWrapper, StyledLoadingWrapper } from './style';

const INIT_STATE = {
  offset: [0, 0] as [number, number],
};

type ImageViewerProps = {
  file: FileInfo;
} & Omit<FixedModalProps, 'children'>;

const ImageViewer = ({ visible, onClose, file }: ImageViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const sourceUrl = useMemo(() => getFileSourceUrl(file), [file]);
  const [offset, setOffset] = useState(INIT_STATE.offset);
  const imageRef = useRef<HTMLImageElement>(null);

  // 图片位置、缩放、旋转样式
  const imageStyle = useMemo<CSSProperties>(() => {
    return {
      transform: `translate(${offset[0]}px, ${offset[1]}px)`,
    };
  }, [offset]);

  const handleDragStart = useCallback(() => {
    imageRef.current?.style.setProperty('transition', 'none', 'important');
  }, [imageRef]);

  const handleDragEnd = useCallback(() => {
    imageRef.current?.style.removeProperty('transition');
  }, [imageRef]);

  const { events, reset } = useDrag({
    callback: setOffset,
    onStart: handleDragStart,
    onEnd: handleDragEnd,
  });

  // 重置
  const handleReset = useCallback(() => {
    setOffset(INIT_STATE.offset);
    reset();
  }, [setOffset, reset]);

  return (
    <FixedModal
      visible={visible}
      onClose={onClose}
    >
      <StyledImageWrapper>
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
            {...events}
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
        <IconButton>
          <ZoomOutRounded />
        </IconButton>
        {/* 放大 */}
        <IconButton>
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
