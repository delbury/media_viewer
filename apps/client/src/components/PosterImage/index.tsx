import useImageViewer from '#/hooks/useImageViewer';
import { API_BASE_URL } from '#/request';
import { FileInfo, joinUrlWithQueryString } from '#pkgs/apis';
import { CircularProgress } from '@mui/material';
import { useCallback, useMemo, useRef, useState } from 'react';
import { StyledFilePosterLoading, StyledFilePosterWrapper } from './style';

interface PosterImageProps {
  file: FileInfo;
  disabled?: boolean;
  viewerAutoMount?: boolean;
}

const PosterImage = ({ disabled, file, viewerAutoMount }: PosterImageProps) => {
  // const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const showImage = useMemo(() => {
    if (!disabled && file.fileType === 'image') return true;
    return false;
  }, [disabled, file.fileType]);

  const urls = useMemo(() => {
    if (!showImage) return null;

    const posterUrl = joinUrlWithQueryString(
      'filePoster',
      {
        basePathIndex: file.basePathIndex.toString(),
        relativePath: file.relativePath,
      },
      API_BASE_URL
    );

    const realUrl = joinUrlWithQueryString(
      'fileGet',
      {
        basePathIndex: file.basePathIndex.toString(),
        relativePath: file.relativePath,
      },
      API_BASE_URL
    );

    return {
      realUrl,
      posterUrl,
    };
  }, [file.basePathIndex, file.relativePath, showImage]);

  const imageRef = useRef<HTMLImageElement>(null);
  const { viewer, createViewer } = useImageViewer({
    enabled: true,
    viewerAutoMount,
    imageRef,
  });

  const handleClick = useCallback(() => {
    if (!viewerAutoMount) {
      const v = viewer ?? createViewer();
      v?.show(true);
    }
  }, [createViewer, viewerAutoMount, viewer]);

  return (
    <StyledFilePosterWrapper onClick={handleClick}>
      {isLoading && (
        <StyledFilePosterLoading>
          <CircularProgress
            sx={{ width: '100%', height: '100%', color: 'text.secondary' }}
            thickness={6}
          />
        </StyledFilePosterLoading>
      )}
      {/* 在这里使用 next/image 会发送两次请求，很奇怪，回退到原生 img 就正常请求一次 */}

      <img
        ref={imageRef}
        src={urls?.posterUrl}
        data-src={urls?.realUrl}
        alt={file.name}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          visibility: isLoading ? 'hidden' : 'visible',
          cursor: 'pointer',
        }}
        loading="lazy"
        onError={() => {
          // setIsError(true);
          setIsLoading(false);
        }}
        onLoad={() => {
          setIsLoading(false);
        }}
      />
    </StyledFilePosterWrapper>
  );
};

export default PosterImage;
