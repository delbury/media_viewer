import { useDialogState } from '#/hooks/useDialogState';
import { useMediaDurationFilter } from '#/hooks/useMediaDurationFilter';
import { useMediaViewerContext } from '#/hooks/useMediaViewerContext';
import { usePersistentConfigValue } from '#/hooks/usePersistentConfig';
import { EMPTY_SYMBOL } from '#/utils/constant';
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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Dialog from '../Dialog';
import { FILE_SORT_API_FIELD_MAP, LESS_FILE_SORT_OPTIONS } from '../DirectoryPicker/constant';
import { useSortList } from '../DirectoryPicker/hooks/useSortList';
import { LessFileExtraInfo } from '../FileExtraInfo';
import GlobalSetting from '../GlobalSetting';
import { ScrollBoxInstance } from '../ScrollBox';
import DurationFilter, {
  DEFAULT_DURATION_RANGE,
  FILE_LIST_PREVIEW_KEY,
  getRealValue,
} from './DurationFilter';
import FileListContent from './FileListContent';
import {
  FILE_ITEM_ROW_HEIGHT,
  StyledCountInfo,
  StyledListPreviewerWrapper,
  StyledSlotWrapper,
  StyleFilesContainer,
} from './style';

interface FileListPreviewerProps {
  currentFileIndex?: number;
  rawFiles?: FileInfo[];
  files?: FileInfo[];
  onFilterFiles?: (files: FileInfo[]) => void;
}

const isSibling = (files: FileInfo[], currentIndex: number, selectedIndex?: number) => {
  return isNil(selectedIndex) || !files?.[selectedIndex]
    ? false
    : files?.[selectedIndex].showDir === files?.[currentIndex].showDir;
};

const FileListPreviewer = ({
  files,
  rawFiles,
  currentFileIndex,
  onFilterFiles,
}: FileListPreviewerProps) => {
  const t = useTranslations();
  const { visible, handleOpen, handleClose } = useDialogState();
  const settingDialog = useDialogState(false);
  const fileCount = useMemo(() => files?.length ?? 0, [files]);
  const scrollBoxRef = useRef<ScrollBoxInstance>(null);

  // 筛选
  const defaultDuration = usePersistentConfigValue<number[]>(FILE_LIST_PREVIEW_KEY);
  const [durationRange, setDurationRange] = useState(
    getRealValue(defaultDuration ?? DEFAULT_DURATION_RANGE)
  );
  const { filteredFiles } = useMediaDurationFilter({ files: rawFiles, durationRange });

  // 排序
  const { sortedItems, SortToolRow } = useSortList({
    items: filteredFiles ?? [],
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

  // 应用筛选
  const handleApplyFilter = useCallback(() => {
    onFilterFiles?.(sortedItems);
    handleClose();
  }, [handleClose, onFilterFiles, sortedItems]);

  useEffect(() => {
    onFilterFiles?.(sortedItems);
  }, []);

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
          onOk={handleApplyFilter}
          okBtnText={t('Btn.ApplyFilter')}
          titleRightSlot={
            <StyledSlotWrapper>
              <IconButton onClick={scrollToTop}>
                <PublishRounded fontSize="small" />
              </IconButton>

              <IconButton onClick={scrollToCurrentFile}>
                <PinDropRounded fontSize="small" />
              </IconButton>

              <StyledCountInfo>
                <span>{realFileIndex + 1 || EMPTY_SYMBOL}</span>
                <span>
                  {sortedItems.length} / {files?.length ?? 0}
                </span>
              </StyledCountInfo>
            </StyledSlotWrapper>
          }
          leftFooterSlot={
            <IconButton onClick={settingDialog.handleOpen}>
              <SettingsRounded />
            </IconButton>
          }
        >
          {SortToolRow}
          <DurationFilter onChange={setDurationRange} />
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
