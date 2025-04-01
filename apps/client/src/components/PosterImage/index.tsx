import { API_BASE_URL } from '#/request';
import { joinUrlWithQueryString } from '#pkgs/apis';
import { FileInfo } from '#pkgs/shared';
import { CircularProgress } from '@mui/material';
import { useMemo, useState } from 'react';
import { StyledFilePosterLoading, StyledFilePosterWrapper } from './style';

interface PosterImageProps {
  file: FileInfo;
  disabled?: boolean;
}

const PosterImage = ({ disabled, file }: PosterImageProps) => {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imgKey, setImgKey] = useState(0);

  const url = useMemo(() => {
    if (disabled || file.fileType !== 'image') return '';

    const str = joinUrlWithQueryString(
      'filePoster',
      {
        basePathIndex: file.basePathIndex.toString(),
        relativePath: file.relativePath,
      },
      API_BASE_URL
    );
    return str;
  }, [disabled, file.basePathIndex, file.relativePath, file.fileType]);

  const handleClick = () => {
    if (isError && url) {
      // 重试
      setImgKey(v => v + 1);
      setIsError(false);
      setIsLoading(true);
    }
  };

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
        key={imgKey}
        src={url}
        alt={file.name}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          visibility: isLoading ? 'hidden' : 'visible',
        }}
        loading="lazy"
        onError={() => {
          setIsError(true);
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
