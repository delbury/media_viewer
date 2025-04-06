import useImageViewer from '#/hooks/useImageViewer';
import { API_BASE_URL } from '#/request';
import { FileInfo, joinUrlWithQueryString } from '#pkgs/apis';
import { ImageRounded, PlayCircleRounded } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { useCallback, useMemo, useRef, useState } from 'react';
import { StyledFilePosterHover, StyledFilePosterIcon, StyledFilePosterWrapper } from './style';

interface PosterImageProps {
  file: FileInfo;
  disabled?: boolean;
  viewerAutoMount?: boolean;
}

const PosterImage = ({ disabled, file, viewerAutoMount }: PosterImageProps) => {
  const [isError, setIsError] = useState(false);
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
    viewerAutoMount: viewerAutoMount && file.fileType === 'image',
    imageRef,
  });

  // 点击事件
  const handleClick = useCallback(() => {
    if (!urls) return;
    if (urls && isError) {
      // 重试
      setIsLoading(true);
      setIsError(false);
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
  }, [createViewer, viewerAutoMount, viewer, urls, file.fileType, isError, setIsError]);

  const HoverIcon = useMemo(() => {
    if (file.fileType === 'image') return ImageRounded;
    if (file.fileType === 'video') return PlayCircleRounded;
    return null;
  }, [file.fileType]);

  return (
    <StyledFilePosterWrapper onClick={handleClick}>
      {isLoading && (
        <StyledFilePosterIcon>
          <CircularProgress
            sx={{ width: '100%', height: '100%', color: 'text.secondary' }}
            thickness={6}
          />
        </StyledFilePosterIcon>
      )}

      {/* hover 图标 */}
      {!!HoverIcon && !isError && !isLoading && (
        <StyledFilePosterHover>
          <HoverIcon sx={{ height: '60%', width: '60%', color: 'common.white' }} />
        </StyledFilePosterHover>
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
          setIsError(true);
          setIsLoading(false);
        }}
        onLoad={() => {
          setIsError(false);
          setIsLoading(false);
        }}
      />
    </StyledFilePosterWrapper>
  );
};

export default PosterImage;
