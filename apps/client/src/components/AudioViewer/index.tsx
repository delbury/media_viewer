import { useSwr } from '#/hooks/useSwr';
import { getFileUrls } from '#/utils';
import { FileInfo } from '#pkgs/apis';
import { useMemo, useRef, useState } from 'react';
import FixedModal, { FixedModalProps } from '../FixedModal';
import Loading from '../Loading';
import {
  StyledContentWrapper,
  StyledFileName,
  StyledImgContainer,
  StyledLyricArea,
  StyledLyricContent,
  StyledLyricRow,
} from './style';
import { LyricRow, useLyric } from './useLyric';

// 查找当前播放时刻应该属于第 n 句歌词
// n <= currentTime < n + 1
const findLyricIndex = (currentTime: number, lyrics: LyricRow[], currentIndex: number) => {
  // 现根据之前的 index 来查找，优化连续播放时的性能
  if (currentTime >= lyrics[currentIndex].timeNumber) {
    if (currentTime < lyrics[currentIndex + 1]?.timeNumber) return currentIndex;
    if (currentTime < lyrics[currentIndex + 2]?.timeNumber) return currentIndex + 1;
  }

  // 二分查找
  let l = 0;
  let r = lyrics.length - 1;
  while (l < r) {
    if (currentTime >= lyrics[r].timeNumber) return r;

    const m = Math.floor((l + r) / 2);
    if (currentTime >= lyrics[m].timeNumber && currentTime < lyrics[m + 1].timeNumber) {
      return m;
    } else if (currentTime < lyrics[m].timeNumber) {
      r = m - 1;
    } else {
      l = m + 1;
    }
  }
  return l;
};

type AudioViewerProps = {
  file: FileInfo;
} & Omit<FixedModalProps, 'children'>;

const AudioViewer = ({ visible, onClose, file }: AudioViewerProps) => {
  const urls = useMemo(() => getFileUrls(file), [file]);

  const lyricRequest = useSwr('fileText', {
    disabled: !file.lrcPath,
    params: {
      basePathIndex: file.basePathIndex.toString(),
      relativePath: file.lrcPath as string,
    },
  });

  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const { lyrics } = useLyric(lyricRequest.data?.content);
  const lyricsRef = useRef<HTMLElement>(null);

  return (
    <FixedModal
      visible={visible}
      onClose={onClose}
    >
      <StyledContentWrapper>
        <StyledImgContainer>
          {!!urls.poster && (
            <img
              src={urls.poster}
              alt={file.name}
            />
          )}
        </StyledImgContainer>

        <StyledFileName>{file.name}</StyledFileName>

        <StyledLyricArea>
          {lyricRequest.isLoading ? (
            <Loading />
          ) : (
            <StyledLyricContent ref={lyricsRef}>
              {lyrics.map((row, index) => (
                <StyledLyricRow
                  key={row.timeString}
                  isActived={index === currentLyricIndex}
                  data-index={index}
                >
                  {row.words}
                </StyledLyricRow>
              ))}
            </StyledLyricContent>
          )}
        </StyledLyricArea>

        {!!urls.source && (
          <audio
            src={urls.source}
            controls
            onTimeUpdate={ev => {
              const elm = ev.target as HTMLAudioElement;
              const index = findLyricIndex(elm.currentTime, lyrics, currentLyricIndex);
              setCurrentLyricIndex(index);
              const rowElm = lyricsRef.current?.querySelector(`[data-index="${index}"]`);
              rowElm?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
              });
            }}
          />
        )}
      </StyledContentWrapper>
    </FixedModal>
  );
};

export default AudioViewer;
