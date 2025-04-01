import { API_BASE_URL } from '#/request';
import { joinUrlWithQueryString } from '#pkgs/apis';
import { FileInfo } from '#pkgs/shared';
import { useMemo } from 'react';

interface PosterImageProps {
  file: FileInfo;
  disabled?: boolean;
  isLoading: boolean;
  onError: () => void;
  onLoad: () => void;
}

const PosterImage = ({ disabled, file, isLoading, onError, onLoad }: PosterImageProps) => {
  const url = useMemo(() => {
    if (disabled) return '';
    const str = joinUrlWithQueryString(
      'filePoster',
      {
        basePathIndex: file.basePathIndex.toString(),
        relativePath: file.relativePath,
      },
      API_BASE_URL
    );
    return str;
  }, [disabled, file.basePathIndex, file.relativePath]);

  return (
    !disabled && (
      // 在这里使用 next/image 会发送两次请求，很奇怪，回退到原生 img 就正常请求一次
      <img
        src={url}
        alt={file.name}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          visibility: isLoading ? 'hidden' : 'visible',
        }}
        onError={onError}
        onLoad={onLoad}
        loading="lazy"
      />
    )
  );
};

export default PosterImage;
