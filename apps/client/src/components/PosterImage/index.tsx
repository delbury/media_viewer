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
  const isError = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(false);

  const urls = useMemo(() => {
    if (disabled) return null;
    if (file.fileType !== 'image' && file.fileType !== 'video') return null;

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
  }, [file.basePathIndex, file.relativePath, disabled, file.fileType]);

  const imageRef = useRef<HTMLImageElement>(null);
  const { viewer, createViewer } = useImageViewer({
    enabled: true,
    viewerAutoMount,
    imageRef,
  });

  // 点击事件
  const handleClick = useCallback(() => {
    if (!urls) return;
    if (urls && isError.current) {
      // 重试
      setIsLoading(true);
      isError.current = false;
      setRefreshKey(prev => !prev);
    }
    if (file.fileType === 'image') {
      // 图片文件，打开图片浏览器
      if (!viewerAutoMount) {
        const v = viewer ?? createViewer();
        v?.show(true);
      }
    } else if (file.fileType === 'video') {
      // 视频文件，打开视频浏览器
    } else if (file.fileType === 'audio') {
      // 音频文件，打开音频浏览器
    }
  }, [createViewer, viewerAutoMount, viewer, urls, file.fileType]);

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
        key={refreshKey.toString()}
        ref={imageRef}
        src={urls?.posterUrl}
        data-src={urls?.realUrl}
        data-type={file.fileType}
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
          isError.current = true;
          setIsLoading(false);
        }}
        onLoad={() => {
          isError.current = false;
          setIsLoading(false);
        }}
      />
    </StyledFilePosterWrapper>
  );
};

export default PosterImage;
