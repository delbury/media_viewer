import useImageViewer from '#/hooks/useImageViewer';
import { API_BASE_URL } from '#/request';
import { FileInfo, joinUrlWithQueryString } from '#pkgs/apis';
import { ALLOWED_POSTER_FILE_TYPES, detectFileType } from '#pkgs/tools/common';
import {
  FeaturedPlayListOutlined,
  ImageRounded,
  MusicNoteRounded,
  MusicVideoRounded,
  NoteOutlined,
  PanoramaOutlined,
  PlayCircleRounded,
  SmartDisplayOutlined,
} from '@mui/icons-material';
import { CircularProgress, SvgIconOwnProps } from '@mui/material';
import { useCallback, useMemo, useRef, useState } from 'react';
import 'viewerjs/dist/viewer.css';
import { StyledFilePosterHover, StyledFilePosterIcon, StyledFilePosterWrapper } from './style';

const FileIcon = ({ ext, iconProps }: { ext: string; iconProps?: SvgIconOwnProps }) => {
  const fileType = detectFileType(ext);

  if (fileType === 'video') {
    return <SmartDisplayOutlined {...iconProps} />;
  }
  if (fileType === 'audio') {
    return (
      <MusicVideoRounded
        // viewBox="0 -1.5 24 27"
        {...iconProps}
      />
    );
  }
  if (fileType === 'image') {
    return <PanoramaOutlined {...iconProps} />;
  }
  if (fileType === 'text') {
    return (
      <FeaturedPlayListOutlined
        viewBox="0 -1.5 24 27"
        {...iconProps}
      />
    );
  }
  return <NoteOutlined {...iconProps} />;
};
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
    if (file.fileType !== 'image' && file.fileType !== 'video' && file.fileType !== 'audio')
      return null;

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

  // 点击事件;
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
      // TODO
      console.log(file.fileType);
    } else if (file.fileType === 'audio') {
      // 音频文件，打开音频浏览器
      // TODO
      console.log(file.fileType);
    }
  }, [createViewer, viewerAutoMount, viewer, urls, file.fileType, isError, setIsError]);

  const HoverIcon = useMemo(() => {
    switch (file.fileType) {
      case 'audio':
        return MusicNoteRounded;
      case 'image':
        return ImageRounded;
      case 'video':
        return PlayCircleRounded;
    }
    return null;
  }, [file.fileType]);

  const allowed = useMemo(() => ALLOWED_POSTER_FILE_TYPES.includes(file.fileType), [file.fileType]);

  return (
    <StyledFilePosterWrapper onClick={handleClick}>
      {disabled || !allowed ? (
        <FileIcon
          ext={file.nameExt}
          iconProps={{ sx: { height: '100%', width: '100%' } }}
        />
      ) : (
        <>
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
              <HoverIcon sx={{ height: '75%', width: '75%', color: 'common.white' }} />
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
              visibility: isLoading ? 'hidden' : 'visible',
              width: '100%',
              height: ' 100%',
              objectFit: 'contain',
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
        </>
      )}
    </StyledFilePosterWrapper>
  );
};

export default PosterImage;
