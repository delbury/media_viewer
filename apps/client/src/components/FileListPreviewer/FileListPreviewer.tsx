import { useDialogState } from '#/hooks/useDialogState';
import { useMediaViewerContext } from '#/hooks/useMediaViewerContext';
import { FileInfo } from '#pkgs/apis';
import {
  FormatListBulletedRounded,
  PinDropRounded,
  PublishRounded,
  SettingsRounded,
} from '@mui/icons-material';
import { Badge, IconButton } from '@mui/material';
import { isNil } from 'lodash-es';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useRef } from 'react';
import Dialog from '../Dialog';
import { FILE_SORT_API_FIELD_MAP, LESS_FILE_SORT_OPTIONS } from '../DirectoryPicker/constant';
import { useSortList } from '../DirectoryPicker/hooks/useSortList';
import { LessFileExtraInfo } from '../FileExtraInfo';
import GlobalSetting from '../GlobalSetting';
import { ScrollBoxInstance } from '../ScrollBox';
import FileListContent from './FileListContent';
import {
  FILE_ITEM_ROW_HEIGHT,
  StyledListPreviewerWrapper,
  StyledSlotWrapper,
  StyleFilesContainer,
} from './style';

interface FileListPreviewerProps {
  currentFileIndex?: number;
  files?: FileInfo[];
}

const isSibling = (files: FileInfo[], currentIndex: number, selectedIndex?: number) => {
  return isNil(selectedIndex)
    ? false
    : files?.[selectedIndex].showDir === files?.[currentIndex].showDir;
};

const FileListPreviewer = ({ files, currentFileIndex }: FileListPreviewerProps) => {
  const t = useTranslations();
  const { visible, handleOpen, handleClose } = useDialogState();
  const settingDialog = useDialogState(false);
  const fileCount = useMemo(() => files?.length ?? 0, [files]);
  const scrollBoxRef = useRef<ScrollBoxInstance>(null);

  // 排序
  const { sortedItems, SortToolRow } = useSortList({
    items: files ?? [],
    apiFieldMap: FILE_SORT_API_FIELD_MAP,
    persistentKeyPrefix: 'filePlayPreviewList',
    fileSortOptions: LESS_FILE_SORT_OPTIONS,
    exclusive: true,
  });

  // 排序后的当前视频 index
  const realFileIndex = useMemo(() => {
    return sortedItems.findIndex(it => it === files?.[currentFileIndex ?? 0]);
  }, [currentFileIndex, files, sortedItems]);

  // 当前视频的滚动距离
  const defaultScroll = useMemo(() => {
    return FILE_ITEM_ROW_HEIGHT * ((realFileIndex ?? 0) - 0.5);
  }, [realFileIndex]);

  const scrollToCurrentFile = useCallback(() => {
    scrollBoxRef.current?.scrollTo({
      top: defaultScroll,
      behavior: 'instant',
    });
  }, [defaultScroll]);

  const scrollToTop = useCallback(() => {
    scrollBoxRef.current?.scrollTo({
      top: 0,
      behavior: 'instant',
    });
  }, []);

  const { jumpToFile } = useMediaViewerContext();
  const handleJumpToFileIndex = useCallback(
    (_: FileInfo, index: number) => {
      const rawIndex = files?.findIndex(it => it === sortedItems[index]);
      jumpToFile(rawIndex);
      handleClose();
    },
    [files, handleClose, jumpToFile, sortedItems]
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
              <IconButton onClick={scrollToTop}>
                <PublishRounded fontSize="small" />
              </IconButton>

              <IconButton onClick={scrollToCurrentFile}>
                <PinDropRounded fontSize="small" />
              </IconButton>

              <span>
                {realFileIndex + 1} / {files?.length ?? 0}
              </span>
            </StyledSlotWrapper>
          }
          leftFooterSlot={
            <IconButton onClick={settingDialog.handleOpen}>
              <SettingsRounded />
            </IconButton>
          }
        >
          {SortToolRow}
          <StyleFilesContainer>
            <FileListContent
              scrollBoxRef={scrollBoxRef}
              files={sortedItems}
              selectedIndex={realFileIndex}
              onItemClick={handleJumpToFileIndex}
              isSibling={isSibling}
              RowExtraComp={LessFileExtraInfo}
              rowHeight={FILE_ITEM_ROW_HEIGHT}
              titleLineClamp={2}
            />
          </StyleFilesContainer>
        </Dialog>
      )}

      {settingDialog.visible && (
        <GlobalSetting
          visible={settingDialog.visible}
          onClose={settingDialog.handleClose}
        />
      )}
    </StyledListPreviewerWrapper>
  );
};

export default FileListPreviewer;
