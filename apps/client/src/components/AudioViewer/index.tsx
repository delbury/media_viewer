import { useFileSecondaryTitle } from '#/hooks/useFileSecondaryTitle';
import { useThrottle } from '#/hooks/useThrottle';
import { getFilePosterUrl, getFileSourceUrl } from '#/utils';
import { FileInfo } from '#pkgs/apis';
import { PauseCircleRounded, PlayCircleRounded } from '@mui/icons-material';
import { Button, IconButton, SxProps, Theme } from '@mui/material';
import { useTranslations } from 'next-intl';
import { SyntheticEvent, useCallback, useMemo, useRef, useState } from 'react';
import Empty from '../Empty';
import FileListPreviewer from '../FileListPreviewer';
import FixedModal, { FixedModalProps } from '../FixedModal';
import Loading from '../Loading';
import MediaControls, { MediaControlsInstance } from '../MediaControls';
import {
  StyledContentWrapper,
  StyledCoverBtnWrapper,
  StyledImgContainer,
  StyledLyricArea,
  StyledLyricContent,
  StyledLyricRow,
  StyledScrollRecover,
} from './style';
import { findLyricIndex, useLyric } from './useLyric';

type AudioViewerProps = {
  file?: FileInfo;
  isList?: boolean;
  firstDisabled?: boolean;
  lastDisabled?: boolean;
  isRandomPlay?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  onToggleRandom?: () => void;
} & Omit<FixedModalProps, 'children'>;

const MEDIA_BTN_SX: SxProps<Theme> = {
  padding: 0,
  width: '100%',
  height: '100%',
};
const MEDIA_ICON_SX: SxProps<Theme> = {
  padding: '12.5%',
  width: '100%',
  height: '100%',
};

const AudioViewer = ({
  visible,
  onClose,
  file,
  lastDisabled,
  firstDisabled,
  isList,
  isRandomPlay,
  onNext,
  onPrev,
  onToggleRandom,
}: AudioViewerProps) => {
  const t = useTranslations();
  const audioRef = useRef<HTMLAudioElement>(null);
  const controlsRef = useRef<MediaControlsInstance>(null);

  // 用户滚动中
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  // 播放中
  const [isPaused, setIsPaused] = useState(true);
  // 等待中
  const [isWaiting, setIsWaiting] = useState(false);

  // 链接
  const posterUrl = useMemo(() => getFilePosterUrl(file), [file]);
  const sourceUrl = useMemo(() => getFileSourceUrl(file), [file]);

  // 歌词相关
  const lyricsRef = useRef<HTMLElement>(null);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const { lyrics, isLoading, hasLyric } = useLyric(file);

  // 标题
  const { title, secondaryTitle } = useFileSecondaryTitle(file);

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

  return (
    <FixedModal
      visible={visible}
      onClose={onClose}
      title={title}
      secondaryTitle={secondaryTitle}
      headerLeftSlot={isList && <FileListPreviewer />}
      footerSlot={
        // 工具栏
        <MediaControls
          ref={controlsRef}
          mediaRef={audioRef}
          onPausedStateChange={setIsPaused}
          onWaitingStateChange={setIsWaiting}
          file={file}
          lastDisabled={lastDisabled}
          firstDisabled={firstDisabled}
          isList={isList}
          isRandomPlay={isRandomPlay}
          onNext={onNext}
          onPrev={onPrev}
          onToggleRandom={onToggleRandom}
        />
      }
    >
      <StyledContentWrapper>
        <StyledImgContainer>
          {!!posterUrl && (
            <img
              src={posterUrl}
              alt={title}
            />
          )}
          <StyledCoverBtnWrapper>
            {isWaiting ? (
              <Loading
                size="75%"
                lazy
              />
            ) : (
              <IconButton
                onClick={controlsRef.current?.togglePlay}
                sx={MEDIA_BTN_SX}
              >
                {isPaused ? (
                  <PauseCircleRounded sx={MEDIA_ICON_SX} />
                ) : (
                  <PlayCircleRounded sx={MEDIA_ICON_SX} />
                )}
              </IconButton>
            )}
          </StyledCoverBtnWrapper>
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
                    isActivated={index === currentLyricIndex}
                    // 作为当前歌词的 id
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

        <audio
          ref={audioRef}
          src={sourceUrl || 'null'}
          // controls
          onTimeUpdate={handleTimeUpdateThrottle}
        />
      </StyledContentWrapper>
    </FixedModal>
  );
};

export default AudioViewer;
