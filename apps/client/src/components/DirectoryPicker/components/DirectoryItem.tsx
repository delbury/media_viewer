import { useMediaViewerContext } from '#/hooks/useMediaViewerContext';
import { formatDate } from '#/utils';
import { EMPTY_SYMBOL } from '#/utils/constant';
import { DirectoryInfo } from '#pkgs/apis';
import { MediaFileType } from '#pkgs/shared';
import { AlbumRounded, ImageRounded, MovieRounded, PlayCircleRounded } from '@mui/icons-material';
import { ListItemIcon, ListItemText, ListItemTextProps, SxProps, Theme } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo } from 'react';
import { DIRECTORY_ITEM_HEIGHT } from '../constant';
import {
  StyledListItem,
  StyledListItemButton,
  StyledSubIcon,
  StyleIconBtn,
} from '../style/directory-item';

interface DirectoryItemProps {
  dir: DirectoryInfo;
  onClick?: (dir: DirectoryInfo) => void;
  sx?: SxProps<Theme>;
}

const LIST_ITEM_TEXT_SLOT_PROPS: ListItemTextProps['slotProps'] = {
  primary: {
    sx: {
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      fontSize: '0.875rem',
    },
  },
  secondary: {
    sx: {
      display: 'flex !important',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '0.65rem',
      // lineHeight: 1.2,
    },
  },
};

// 播放按钮
const PlayIconBtn = ({
  disabled,
  onClick,
  children,
}: {
  children?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) => {
  return (
    <StyleIconBtn
      disabled={disabled}
      onClick={onClick}
    >
      {children}
      <StyledSubIcon>
        <PlayCircleRounded />
      </StyledSubIcon>
    </StyleIconBtn>
  );
};

const DirectoryItem = ({ dir, onClick, sx }: DirectoryItemProps) => {
  const t = useTranslations();

  const { noAudio, noImage, noVideo } = useMemo(() => {
    return {
      noImage: !dir.totalMediaFilesCount.image,
      noVideo: !dir.totalMediaFilesCount.video,
      noAudio: !dir.totalMediaFilesCount.audio,
    };
  }, [dir.totalMediaFilesCount]);

  const timeInfo = useMemo(
    () => `${t('Tools.UpdatedTime')}${t(':')}${formatDate(dir.updated)}`,
    [t, dir.updated]
  );
  const fileInfo = useMemo(
    () => `${dir.totalFilesCount} ${t('Common.Files')}`,
    [t, dir.totalFilesCount]
  );

  // 打开媒体浏览器
  const { openMediaViewer } = useMediaViewerContext();
  const handleMediaInfoClick = useCallback(
    (type: MediaFileType) => {
      if (dir) openMediaViewer({ dir, mediaType: type });
    },
    [dir, openMediaViewer]
  );

  return (
    <StyledListItem sx={{ height: `${DIRECTORY_ITEM_HEIGHT}px`, ...sx }}>
      <ListItemIcon sx={{ gap: '8px' }}>
        <PlayIconBtn
          disabled={noVideo}
          onClick={() => handleMediaInfoClick('video')}
        >
          <MovieRounded />
        </PlayIconBtn>

        <PlayIconBtn
          disabled={noAudio}
          onClick={() => handleMediaInfoClick('audio')}
        >
          <AlbumRounded />
        </PlayIconBtn>

        <PlayIconBtn
          disabled={noImage}
          onClick={() => handleMediaInfoClick('image')}
        >
          <ImageRounded />
        </PlayIconBtn>
      </ListItemIcon>

      <StyledListItemButton
        disabled={!onClick}
        onClick={() => onClick?.(dir)}
      >
        <ListItemText
          primary={dir.name || EMPTY_SYMBOL}
          secondary={
            <>
              <span>{timeInfo}</span>
              <span>{fileInfo}</span>
            </>
          }
          sx={{
            margin: 0,
          }}
          slotProps={LIST_ITEM_TEXT_SLOT_PROPS}
        />
      </StyledListItemButton>
    </StyledListItem>
  );
};

export default DirectoryItem;
