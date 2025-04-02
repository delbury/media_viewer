import { RefObject, useEffect, useRef } from 'react';
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
};

interface UseImageViewerParams {
  enabled?: boolean;
  imageRef: RefObject<HTMLElement | null>;
}
const useImageViewer = ({ enabled, imageRef }: UseImageViewerParams) => {
  const viewer = useRef<RealViewer>(null);

  useEffect(() => {
    if (enabled && imageRef.current) {
      const v = new Viewer(imageRef.current, {
        navbar: false,
        title: false,
        initialCoverage: 1,
        scalable: false,
        rotatable: true,
        transition: true,
        toggleOnDblclick: false,
        toolbar: {
          zoomOut: true,
          zoomIn: true,
          oneToOne: true,
          reset: {
            show: true,
            size: 'large',
          },
          prev: false,
          play: false,
          next: false,
          rotateLeft: true,
          rotateRight: true,
          flipHorizontal: false,
          flipVertical: false,
        },

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
      }) as RealViewer;
      viewer.current = v;

      return () => {
        viewer.current?.destroy();
        viewer.current = null;
      };
    }
  }, [enabled, imageRef]);
};

export default useImageViewer;
