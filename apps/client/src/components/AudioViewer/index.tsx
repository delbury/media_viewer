import { useMediaPlayBtn } from '#/hooks/useMediaPlayBtn';
import { useThrottle } from '#/hooks/useThrottle';
import { getFilePosterUrl, getFileSourceUrl } from '#/utils';
import { FileInfo } from '#pkgs/apis';
import { Button } from '@mui/material';
import { useTranslations } from 'next-intl';
import { SyntheticEvent, useCallback, useMemo, useRef, useState } from 'react';
import Empty from '../Empty';
import FixedModal, { FixedModalProps } from '../FixedModal';
import Loading from '../Loading';
import {
  StyledContentWrapper,
  StyledImgContainer,
  StyledLyricArea,
  StyledLyricContent,
  StyledLyricRow,
  StyledScrollRecover,
} from './style';
import { findLyricIndex, useLyric } from './useLyric';

type AudioViewerProps = {
  file: FileInfo;
} & Omit<FixedModalProps, 'children'>;

const AudioViewer = ({ visible, onClose, file }: AudioViewerProps) => {
  const t = useTranslations();
  const audioRef = useRef<HTMLAudioElement>(null);

  // 用户滚动中
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // 链接
  const posterUrl = useMemo(() => getFilePosterUrl(file), [file]);
  const sourceUrl = useMemo(() => getFileSourceUrl(file), [file]);

  // 歌词相关
  const lyricsRef = useRef<HTMLElement>(null);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const { lyrics, isLoading, hasLyric } = useLyric(file);

  // 播放回调
  const handleTimeUpdate = useCallback(
    (ev: SyntheticEvent<HTMLAudioElement, Event>) => {
      if (!hasLyric) return;

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
    [hasLyric, lyrics, currentLyricIndex, isUserScrolling]
  );
  const handleTimeUpdateThrottle = useThrottle(handleTimeUpdate, 100);

  // 用户拖拽
  const handleScrollByUser = useCallback(() => {
    setIsUserScrolling(true);
  }, []);
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

  const { MediaBtn } = useMediaPlayBtn({ mediaRef: audioRef });

  return (
    <FixedModal
      visible={visible}
      onClose={onClose}
      title={file.name}
    >
      <StyledContentWrapper>
        <StyledImgContainer>
          {!!posterUrl && (
            <img
              src={posterUrl}
              alt={file.name}
            />
          )}
          {MediaBtn}
        </StyledImgContainer>

        <StyledLyricArea>
          {isLoading ? (
            <Loading />
          ) : lyrics.length ? (
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
          ) : (
            <Empty sx={{ color: 'common.white' }} />
          )}
        </StyledLyricArea>

        {!!sourceUrl && (
          <audio
            ref={audioRef}
            src={sourceUrl}
            controls
            onTimeUpdate={handleTimeUpdateThrottle}
          />
        )}
      </StyledContentWrapper>
    </FixedModal>
  );
};

export default AudioViewer;
