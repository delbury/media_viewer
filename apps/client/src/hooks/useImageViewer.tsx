import { RefObject, useCallback, useEffect, useState } from 'react';
import Viewer from 'viewerjs';
import 'viewerjs/dist/viewer.css';

interface ImageData {
  aspectRatio: number;
  height: number;
  left: number;
  naturalHeight: number;
  naturalWidth: number;
  oldRatio: number;
  ratio: number;
  rotate: number;
  top: number;
  width: number;
  x: number;
  y: number;
}

type RealViewer = Viewer & {
  initialImageData: ImageData;
  imageData: ImageData;
  element: HTMLElement;
  images: HTMLImageElement[];
  image: HTMLImageElement;
};

interface UseImageViewerParams {
  enabled?: boolean;
  isGallery?: boolean;
  imageRef: RefObject<HTMLElement | null>;
  // 自动挂载
  viewerAutoMount?: boolean;
  filter?: (image: HTMLImageElement) => boolean;
}

const useImageViewer = ({
  enabled,
  isGallery,
  imageRef,
  viewerAutoMount = false,
  filter,
}: UseImageViewerParams) => {
  const [viewer, setViewer] = useState<RealViewer | null>(null);

  isGallery = !!isGallery;

  const createViewer = useCallback(() => {
    if (enabled && imageRef.current) {
      // 先移除旧的实例
      viewer?.destroy();

      const v = new Viewer(imageRef.current, {
        navbar: isGallery,
        title: false,
        initialCoverage: 1,
        scalable: false,
        rotatable: true,
        transition: true,
        toggleOnDblclick: false,
        movable: true,
        toolbar: {
          zoomOut: true,
          zoomIn: true,
          oneToOne: true,
          prev: isGallery,
          play: false,
          next: isGallery,
          reset: {
            show: true,
            size: 'large',
          },
          rotateLeft: true,
          rotateRight: true,
          flipHorizontal: false,
          flipVertical: false,
        },
        filter,
        url: (image: HTMLImageElement) => {
          return image.dataset.src || image.src;
        },
        rotate: ev => {
          if (ev.detail.degree % 180 === 0) {
            // 旋转到180/360度
            const zoom = Math.min(
              v.initialImageData.width / v.initialImageData.naturalWidth,
              v.initialImageData.height / v.initialImageData.naturalHeight
            );
            v.zoomTo(zoom);
            v.moveTo(v.initialImageData.x, v.initialImageData.y);
          } else {
            // 旋转到90/270度
            const { innerWidth, innerHeight } = window;
            const zoom = Math.min(
              innerHeight / v.initialImageData.naturalWidth,
              innerWidth / v.initialImageData.naturalHeight
            );
            const oldZoom = Math.min(
              v.initialImageData.width / v.initialImageData.naturalWidth,
              v.initialImageData.height / v.initialImageData.naturalHeight
            );
            const dw = (v.initialImageData.naturalWidth * (zoom - oldZoom)) / 2;
            const dh = (v.initialImageData.naturalHeight * (zoom - oldZoom)) / 2;
            v.zoomTo(zoom);
            v.moveTo(v.initialImageData.x - dw, v.initialImageData.y - dh);
          }
        },
        hidden: () => {
          if (!viewerAutoMount) {
            v?.destroy();
            setViewer(null);
          }
        },
      }) as RealViewer;
      viewer?.destroy();
      setViewer(v);
      return v;
    }
  }, [enabled, imageRef, isGallery, viewer, viewerAutoMount, filter]);

  useEffect(() => {
    if (viewerAutoMount) {
      const v = createViewer();
      return () => {
        v?.destroy();
      };
    }
  }, [enabled, isGallery]);

  return {
    viewer,
    createViewer,
  };
};

export default useImageViewer;
