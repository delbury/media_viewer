'use client';

import ResizeContainer from '#/components/ResizeContainer';
import ScrollBox from '#/components/ScrollBox';
import { GridLayout, VirtualListChildItemProps } from '#/components/ScrollBox/hooks/useVirtualList';
import { useMediaViewerContext } from '#/hooks/useMediaViewerContext';
import { usePersistentConfig } from '#/hooks/usePersistentConfig';
import { h5Max } from '#/style/device';
import { TFunction } from '#/types/i18n';
import { DirectoryInfo, FileInfo } from '#pkgs/apis';
import { FullFileType, MediaFileType } from '#pkgs/shared';
import { isMediaFile } from '#pkgs/tools/common';
import { useMediaQuery } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import {
  FILE_FILTER_OPTIONS,
  FILE_SORT_API_FIELD_MAP,
  FILE_SORT_OPTIONS,
  FILE_TYPE_EXTS,
  FileFilterField,
} from '../constant';
import { useResetBtn } from '../hooks/useResetBtn';
import { useSortList } from '../hooks/useSortList';
import {
  FILE_GRID_SIZE,
  StyledFileCount,
  StyledFileCountGroup,
  StyledFileGrid,
  StyledFileInfoRow,
  StyledFileToolRow,
} from '../style/file-item-list';
import FileDetailDialog from './FileDetailDialog';
import FileItem from './FileItem';
import ToolGroupBtn from './ToolGroupBtn';

const calcGridLayout = (isH5: boolean, childCount: number, contentWidth: number): GridLayout => {
  // padding 4px
  // gap 8px
  // grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));

  const { gap, gapH5, padding, minWidth } = FILE_GRID_SIZE;
  const currentGap = isH5 ? gapH5 : gap;
  // 去除 padding 的实际可用宽度
  const pureWidth = contentWidth - padding * 2;
  let colWidth = pureWidth;
  let cols = 1;
  // 如果「实际可用宽度」>= 2 * minWidth + gap，则一行不止一个元素
  if (pureWidth >= minWidth * 2 + currentGap) {
    cols++;
    // 计算每行的元素数量，以及行元素宽度
    while (true) {
      cols++;
      if ((cols - 1) * currentGap + cols * minWidth > pureWidth) {
        // 最小宽度的情况下都放不下
        cols--;
        colWidth = (pureWidth - currentGap * (cols - 1)) / cols;
        break;
      }
    }
  }
  const rows = Math.ceil(childCount / cols);

  return {
    rows,
    cols,
    rowHeight: colWidth,
    colWidth,
    rowGap: currentGap,
    colGap: currentGap,
    paddingTopBottom: padding * 2,
  };
};

// 计算文件数量
const countFileType = (files: FileInfo[], t: TFunction) => {
  const counts: Record<FullFileType, { label: string; value: number; type: FullFileType }> = {
    video: { label: 'Common.Video', value: 0, type: 'video' },
    audio: { label: 'Common.Audio', value: 0, type: 'audio' },
    image: { label: 'Common.Image', value: 0, type: 'image' },
    text: { label: 'Common.Text', value: 0, type: 'text' },
    other: { label: 'Common.Other', value: 0, type: 'other' },
  };
  files.forEach(file => {
    if (counts[file.fileType]) counts[file.fileType].value++;
  });
  const result = Object.values(counts).filter(item => item.value > 0);
  return result.map(item => ({
    showText: `${t(item.label)}${t(':')}${item.value}`,
    type: item.type,
  }));
};

// 文件过滤
const filterFiles = ({
  files,
  filterFileType,
  filterFileExts,
}: {
  files: FileInfo[];
  filterFileType: FileFilterField | null;
  filterFileExts: string[];
}) => {
  if (!filterFileType) return files;

  const newList = files.filter(file => {
    if (file.fileType !== filterFileType) return false;
    if (filterFileExts.length) {
      // 如果有更为细致的文件类型过滤，则判断文件扩展名是否在过滤列表中
      return filterFileExts.includes(file.nameExtPure);
    }
    return true;
  });
  return newList;
};

const ChildItem = (
  props: VirtualListChildItemProps & {
    filteredSortedFiles?: FileInfo[];
    setCurrentFile?: (file: FileInfo) => void;
  }
) => {
  const {
    index,
    params: { offsetY },
    observe,
    filteredSortedFiles,
    setCurrentFile,
  } = props;

  const file = filteredSortedFiles?.[index];

  return (
    !!file && (
      <FileItem
        file={file}
        onTitleClick={setCurrentFile}
        sx={{
          transform: `translateY(${offsetY}px)`,
        }}
        refBindCallback={observe}
      />
    )
  );
};

interface FileItemListProps {
  dir?: DirectoryInfo;
  files: FileInfo[];
  storageKeySuffix?: string;
}

const DEFAULT_VALUES = {
  filterFileType: null,
  filterFileExts: [] as string[],
};

const FileItemList = ({ dir, files, storageKeySuffix = '' }: FileItemListProps) => {
  const t = useTranslations();
  const isH5 = useMediaQuery(h5Max);

  const [filterFileType, setFilterFileType] = usePersistentConfig<FileFilterField | null>(
    DEFAULT_VALUES.filterFileType,
    {
      prefix: 'directoryPickerFilesFilterFileType',
      suffix: storageKeySuffix,
    }
  );
  const [filterFileExts, setFilterFileExts] = usePersistentConfig<string[]>(
    DEFAULT_VALUES.filterFileExts,
    {
      prefix: 'directoryPickerFilesFilterFileExts',
      suffix: storageKeySuffix,
    }
  );
  const fileTypeExts = useMemo(() => {
    if (!filterFileType) return [];
    return FILE_TYPE_EXTS[filterFileType];
  }, [filterFileType]);

  // 筛选和排序后的文件列表
  const filteredFiles = useMemo(() => {
    return filterFiles({
      files,
      filterFileType,
      filterFileExts,
    });
  }, [files, filterFileType, filterFileExts]);

  const { sortedItems: filteredSortedFiles, SortToolRow } = useSortList({
    items: filteredFiles,
    apiFieldMap: FILE_SORT_API_FIELD_MAP,
    persistentKeyPrefix: 'directoryPickerFiles',
    persistentKeySuffix: storageKeySuffix,
    fileSortOptions: FILE_SORT_OPTIONS,
  });

  // 各类文件数量
  const fileTypeCountInfo = useMemo(() => {
    return countFileType(files, t);
  }, [files, t]);

  const { ResetBtn: ResetFilterBtn } = useResetBtn(() => {
    setFilterFileType(DEFAULT_VALUES.filterFileType);
    setFilterFileExts(DEFAULT_VALUES.filterFileExts);
  });

  const [currentFile, setCurrentFile] = useState<FileInfo | null>(null);
  const handleCloseDetail = useCallback(() => {
    setCurrentFile(null);
  }, []);

  // 打开媒体浏览器
  const { openMediaViewer } = useMediaViewerContext();
  const handleMediaInfoClick = useCallback(
    (type: MediaFileType) => {
      if (dir)
        openMediaViewer({
          dir: {
            ...dir,
            // 只播放当前文件夹下的文件，排除子文件夹
            children: [],
          },
          mediaType: type,
        });
    },
    [dir, openMediaViewer]
  );

  return (
    <>
      <ResizeContainer
        height="20dvh"
        // title={t('Tools.CurrentFiles')}
        resizePosition="top"
        persistentKey={`directoryPickerFiles${storageKeySuffix}`}
        sx={{ position: 'relative' }}
        beforeContentSlot={
          <>
            {SortToolRow}
            <StyledFileToolRow>
              {ResetFilterBtn}
              <ToolGroupBtn
                exclusive
                items={FILE_FILTER_OPTIONS}
                value={filterFileType}
                onChange={(_, value) => {
                  setFilterFileType(value);
                  setFilterFileExts([]);
                }}
              />
              <ScrollBox hideScrollbar>
                <ToolGroupBtn
                  rawLabel
                  items={fileTypeExts}
                  value={filterFileExts}
                  onChange={(_, value) => setFilterFileExts(value)}
                />
              </ScrollBox>
            </StyledFileToolRow>
          </>
        }
        afterContentSlot={
          <StyledFileInfoRow>
            <StyledFileCountGroup>
              {fileTypeCountInfo.map(({ showText, type }) => {
                const isMedia = isMediaFile(type);
                return (
                  <StyledFileCount
                    key={showText}
                    clickable={isMedia}
                    onClick={() => handleMediaInfoClick(type as MediaFileType)}
                  >
                    {/* {isMedia && <PlayArrowRounded fontSize="inherit" />} */}
                    {showText}
                  </StyledFileCount>
                );
              })}
            </StyledFileCountGroup>
            <span>
              {filteredSortedFiles.length} / {files.length}
            </span>
          </StyledFileInfoRow>
        }
        scrollBoxProps={{
          emptyText: t('Tools.NoFiles'),
          isEmpty: !files.length,
          lazyLoadEnabled: true,
          virtualListConfig: {
            childCount: filteredSortedFiles.length,
            ChildItem,
            getChildProps: (index: number) => ({
              key: filteredSortedFiles[index]?.relativePath,
              filteredSortedFiles,
              setCurrentFile,
            }),
            RowWrapperComponent: StyledFileGrid,
            calcGridLayout: (...args) => calcGridLayout(isH5, ...args),
            overRowCount: 4,
          },
        }}
      />
      {!!currentFile && (
        <FileDetailDialog
          file={currentFile}
          visible
          onClose={handleCloseDetail}
        />
      )}
    </>
  );
};

export default FileItemList;
