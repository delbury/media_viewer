import { useSwr } from '#/hooks/useSwr';
import { useThrottle } from '#/hooks/useThrottle';
import { getFileUrls } from '#/utils';
import { FileInfo } from '#pkgs/apis';
import { Button } from '@mui/material';
import { useTranslations } from 'next-intl';
import { SyntheticEvent, useCallback, useMemo, useRef, useState } from 'react';
import FixedModal, { FixedModalProps } from '../FixedModal';
import Loading from '../Loading';
import RollingText from '../RollingText';
import {
  StyledContentWrapper,
  StyledImgContainer,
  StyledLyricArea,
  StyledLyricContent,
  StyledLyricRow,
  StyledScrollRecover,
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
  const t = useTranslations();

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
  // 用户滚动中
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // 播放回调
  const handleTimeUpdate = useCallback(
    (ev: SyntheticEvent<HTMLAudioElement, Event>) => {
      const elm = ev.target as HTMLAudioElement;
      const index = findLyricIndex(elm.currentTime, lyrics, currentLyricIndex);
      if (index !== currentLyricIndex) {
        setCurrentLyricIndex(index);

        // 用户滚动时，停止脚本滚动
        if (!isUserScrolling) {
          const rowElm = lyricsRef.current?.querySelector(`[data-index="${index}"]`);
          // 标记脚本滚动
          rowElm?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }
    },
    [currentLyricIndex, lyrics, isUserScrolling]
  );
  const handleTimeUpdateThrottle = useThrottle(handleTimeUpdate, 100);

  // 用户拖拽
  const handleScrollByUser = useCallback(() => {
    setIsUserScrolling(true);
  }, [setIsUserScrolling]);
  const handleScrollByUserThrottle = useThrottle(handleScrollByUser, 200);

  // 恢复自动滚动
  const handleRecoverAutoScroll = useCallback(() => {
    setIsUserScrolling(false);
    const rowElm = lyricsRef.current?.querySelector(`[data-index="${currentLyricIndex}"]`);
    // 标记脚本滚动
    rowElm?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [currentLyricIndex]);

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

        <RollingText
          text={file.name}
          sx={{
            textAlign: 'center',
            fontWeight: 700,
            fontSize: '1.125rem',
          }}
        />

        <StyledLyricArea>
          {lyricRequest.isLoading ? (
            <Loading />
          ) : (
            <>
              <StyledLyricContent
                ref={lyricsRef}
                // 为了区分人为拖拽事件
                onWheel={handleScrollByUserThrottle}
                onTouchMove={handleScrollByUserThrottle}
              >
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
              {isUserScrolling && (
                <StyledScrollRecover>
                  <Button
                    variant="text"
                    color="inherit"
                    onClick={handleRecoverAutoScroll}
                  >
                    {t('Btn.AutoScroll')}
                  </Button>
                </StyledScrollRecover>
              )}
            </>
          )}
        </StyledLyricArea>

        {!!urls.source && (
          <audio
            src={urls.source}
            controls
            onTimeUpdate={handleTimeUpdateThrottle}
          />
        )}
      </StyledContentWrapper>
    </FixedModal>
  );
};

export default AudioViewer;
