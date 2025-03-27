import ResizeContainer from '@/components/ResizeContainer';
import ScrollBox from '@/components/ScrollBox';
import { usePersistentConfig } from '@/hooks/usePersistentConfig';
import { TFunction } from '@/types';
import { ToggleButtonGroupProps, Typography } from '@mui/material';
import { FileInfo, FullFileType } from '@shared';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import {
  FILE_FILTER_OPTIONS,
  FILE_SORT_API_FIELD_MAP,
  FILE_SORT_OPTIONS,
  FILE_TYPE_EXTS,
  FileFilterField,
  FileSortField,
} from '../constant';
import { useResetBtn } from '../hooks/useResetBtn';
import { SortMode, useSortList } from '../hooks/useSortList';
import {
  StyledFileAllCountInfo,
  StyledFileGrid,
  StyledFileToolRow,
  StyledSelectedBadge,
  StyledToggleButton,
  StyledToggleButtonGroup,
} from '../style/file-item-list';
import FileDetailDialog from './FileDetailDialog';
import FileItem from './FileItem';

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

const TBG = ({
  items,
  showOrder,
  value,
  rawLabel,
  ...props
}: ToggleButtonGroupProps & {
  items: {
    value: string;
    label: string;
  }[];
  showOrder?: boolean;
  rawLabel?: boolean;
}) => {
  const t = useTranslations();

  return (
    <StyledToggleButtonGroup
      color="primary"
      size="small"
      value={value}
      {...props}
    >
      {items.map(item => {
        const order =
          showOrder && Array.isArray(value)
            ? (value?.findIndex((field: string) => field === item.value) ?? -1) + 1
            : 0;

        return (
          <StyledToggleButton
            key={item.value}
            value={item.value}
          >
            <Typography variant="body2">{rawLabel ? item.label : t(item.label)}</Typography>
            {!!showOrder && !!order && <StyledSelectedBadge>{order}</StyledSelectedBadge>}
          </StyledToggleButton>
        );
      })}
    </StyledToggleButtonGroup>
  );
};

interface FileItemListProps {
  files: FileInfo[];
}

const DEFAULT_VALUES = {
  sortMode: null,
  sortField: [] as FileSortField[],
  filterFileType: null,
  filterFileExts: [] as string[],
};

const FileItemList = ({ files }: FileItemListProps) => {
  const t = useTranslations();

  const [sortMode, setSortMode] = usePersistentConfig<SortMode | null>(
    DEFAULT_VALUES.sortMode,
    'directoryPickerFilesSortMode'
  );
  const [sortField, setSortField] = usePersistentConfig<FileSortField[]>(
    DEFAULT_VALUES.sortField,
    'directoryPickerFilesSortField'
  );
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

  const filteredSortedFiles = useSortList({
    items: filteredFiles,
    sortMode,
    sortField,
    apiFieldMap: FILE_SORT_API_FIELD_MAP,
  });

  // 各类文件数量
  const fileTypeCountInfo = useMemo(() => {
    return countFileType(files, t);
  }, [files, t]);

  const { ResetBtn: ResetSortBtn } = useResetBtn(() => {
    setSortMode(DEFAULT_VALUES.sortMode);
    setSortField(DEFAULT_VALUES.sortField);
  });
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
            <StyledFileToolRow>
              {ResetSortBtn}
              <TBG
                exclusive
                value={sortMode}
                onChange={(_, value) => setSortMode(value)}
                items={[
                  { value: 'desc', label: 'Common.Desc' },
                  { value: 'asc', label: 'Common.Asc' },
                ]}
              />
              <ScrollBox>
                <TBG
                  items={FILE_SORT_OPTIONS}
                  value={sortField}
                  onChange={(_, value) => setSortField(value)}
                  showOrder
                />
              </ScrollBox>
            </StyledFileToolRow>

            <StyledFileToolRow>
              {ResetFilterBtn}
              <TBG
                exclusive
                items={FILE_FILTER_OPTIONS}
                value={filterFileType}
                onChange={(_, value) => {
                  setFilterFileType(value);
                  setFilterFileExts([]);
                }}
              />

              <ScrollBox>
                <TBG
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
      >
        <StyledFileGrid>
          {filteredSortedFiles.map(file => (
            <FileItem
              key={file.fullPath}
              file={file}
              onTitleClick={setCurrentFile}
            />
          ))}
        </StyledFileGrid>
      </ResizeContainer>
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
