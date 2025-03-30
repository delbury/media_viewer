import ResizeContainer from '#/components/ResizeContainer';
import ScrollBox from '#/components/ScrollBox';
import { GridLayout, VirtualListChildItemProps } from '#/components/ScrollBox/hooks/useVirtualList';
import { usePersistentConfig } from '#/hooks/usePersistentConfig';
import { h5Max } from '#/style/device';
import { TFunction } from '#/types';
import { FileInfo, FullFileType } from '#pkgs/shared';
import { useMediaQuery } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
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
  StyledFileAllCountInfo,
  StyledFileGrid,
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
  const counts: Record<FullFileType, { label: string; value: number }> = {
    video: { label: 'Common.Video', value: 0 },
    audio: { label: 'Common.Audio', value: 0 },
    image: { label: 'Common.Image', value: 0 },
    text: { label: 'Common.Text', value: 0 },
    other: { label: 'Common.Other', value: 0 },
  };
  files.forEach(file => {
    if (counts[file.fileType]) counts[file.fileType].value++;
  });
  const result = Object.values(counts).filter(item => item.value > 0);
  return result.map(item => `${t(item.label)}${t(':')}${item.value}`).join(t(','));
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
  files: FileInfo[];
}

const DEFAULT_VALUES = {
  filterFileType: null,
  filterFileExts: [] as string[],
};

const FileItemList = ({ files }: FileItemListProps) => {
  const t = useTranslations();
  const isH5 = useMediaQuery(h5Max);

  const [filterFileType, setFilterFileType] = usePersistentConfig<FileFilterField | null>(
    DEFAULT_VALUES.filterFileType,
    'directoryPickerFilesFilterFileType'
  );
  const [filterFileExts, setFilterFileExts] = usePersistentConfig<string[]>(
    DEFAULT_VALUES.filterFileExts,
    'directoryPickerFilesFilterFileExts'
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

  return (
    <>
      <ResizeContainer
        height="20vh"
        // title={t('Tools.CurrentFiles')}
        emptyText={t('Tools.NoFiles')}
        isEmpty={!files.length}
        resizePosition="top"
        persistentKey="directoryPickerFiles"
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
              <ScrollBox>
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
          <StyledFileAllCountInfo variant="body2">
            <span>{fileTypeCountInfo}</span>
            <span>
              {files.length} / {filteredSortedFiles.length}
            </span>
          </StyledFileAllCountInfo>
        }
        scrollBoxProps={{
          lazyLoadEnabled: true,
          virtualListConfig: {
            childCount: filteredSortedFiles.length,
            ChildItem,
            getChildProps: (index: number) => ({
              key: filteredSortedFiles[index]?.fullPath,
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
          onClose={() => setCurrentFile(null)}
        />
      )}
    </>
  );
};

export default FileItemList;
