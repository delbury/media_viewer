import { useFileTitle } from '#/hooks/useFileTitle';
import { useMediaViewerContext } from '#/hooks/useMediaViewerContext';
import { getFilePosterUrl } from '#/utils';
import { FileInfo } from '#pkgs/apis';
import { FormatListBulletedRounded, PinDropRounded } from '@mui/icons-material';
import { Badge, IconButton } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useRef, useState } from 'react';
import Dialog from '../Dialog';
import { VirtualListChildItemProps } from '../ScrollBox/hooks/useVirtualList';
import ScrollBox, { ScrollBoxInstance } from './../ScrollBox/index';
import {
  FILE_ITEM_ROW_HEIGHT,
  StyleChildItemDir,
  StyleChildItemImage,
  StyleChildItemInfo,
  StyleChildItemName,
  StyledChildItem,
  StyledListPreviewerWrapper,
  StyledSlotWrapper,
  StyleFilesContainer,
} from './style';

interface FileListPreviewerProps {
  currentFileIndex?: number;
  files?: FileInfo[];
}

type ChildItemProps = {
  onItemClick?: (file: FileInfo, index: number) => void;
} & FileListPreviewerProps &
  VirtualListChildItemProps;

const ChildItem = (props: ChildItemProps) => {
  const {
    index,
    files,
    currentFileIndex,
    onItemClick,
    params: { offsetY },
  } = props;
  const file = files?.[index] as FileInfo;
  const posterUrl = useMemo(() => getFilePosterUrl(file), [file]);
  const activated = index === currentFileIndex;
  const handleItemClick = useCallback(() => onItemClick?.(file, index), [file, index, onItemClick]);
  const { title, secondaryTitle } = useFileTitle({ file });
  const isSibling = files?.[currentFileIndex as number].showDir === files?.[index].showDir;

  return (
    <StyledChildItem
      sx={{
        transform: `translateY(${offsetY}px)`,
      }}
      type={activated ? 'activated' : isSibling ? 'sibling' : void 0}
      onClick={handleItemClick}
    >
      <StyleChildItemImage>
        <img
          src={posterUrl}
          alt={title}
        />
      </StyleChildItemImage>
      <StyleChildItemInfo>
        <StyleChildItemName>{title}</StyleChildItemName>
        <StyleChildItemDir>{secondaryTitle}</StyleChildItemDir>
      </StyleChildItemInfo>
    </StyledChildItem>
  );
};

const FileListPreviewer = ({ files, currentFileIndex }: FileListPreviewerProps) => {
  const t = useTranslations();
  const [visible, setVisible] = useState(false);
  const fileCount = useMemo(() => files?.length ?? 0, [files]);

  const handleOpen = useCallback(() => setVisible(true), []);
  const handleClose = useCallback(() => setVisible(false), []);

  const scrollBoxRef = useRef<ScrollBoxInstance>(null);
  const defaultScroll = FILE_ITEM_ROW_HEIGHT * ((currentFileIndex ?? 0) - 0.5);

  const scrollToCurrentFile = useCallback(() => {
    scrollBoxRef.current?.scrollTo({
      top: defaultScroll,
    });
  }, [defaultScroll]);

  const { jumpToFile } = useMediaViewerContext();
  const handleJumpToFileIndex = useCallback(
    (_: FileInfo, index: number) => {
      jumpToFile(index);
      // setVisible(false);
    },
    [jumpToFile]
  );

  const getChildProps = useCallback(
    (index: number) => ({
      key: files?.[index]?.showPath ?? '',
      files,
      currentFileIndex,
      onItemClick: handleJumpToFileIndex,
    }),
    [currentFileIndex, files, handleJumpToFileIndex]
  );

  return (
    <StyledListPreviewerWrapper>
      <IconButton onClick={handleOpen}>
        <Badge
          badgeContent={fileCount}
          max={999}
        >
          <FormatListBulletedRounded />
        </Badge>
      </IconButton>

      {visible && (
        <Dialog
          title={t('Tools.FileListPreviewer')}
          open={visible}
          onClose={handleClose}
          onlyClose
          titleRightSlot={
            <StyledSlotWrapper>
              <IconButton onClick={scrollToCurrentFile}>
                <PinDropRounded fontSize="small" />
              </IconButton>
              <span>
                {currentFileIndex} / {files?.length ?? 0}
              </span>
            </StyledSlotWrapper>
          }
        >
          <StyleFilesContainer>
            <ScrollBox
              ref={scrollBoxRef}
              sx={{ height: '100%' }}
              emptyText={t('Tools.NoFiles')}
              isEmpty={!files?.length}
              lazyLoadEnabled={true}
              defaultScroll={{
                top: defaultScroll,
              }}
              virtualListConfig={{
                childCount: files?.length ?? 0,
                childHeight: FILE_ITEM_ROW_HEIGHT,
                ChildItem,
                getChildProps,
              }}
            />
          </StyleFilesContainer>
        </Dialog>
      )}
    </StyledListPreviewerWrapper>
  );
};

export default FileListPreviewer;
