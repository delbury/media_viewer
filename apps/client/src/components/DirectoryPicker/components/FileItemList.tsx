import ResizeContainer from '@/components/ResizeContainer';
import ScrollBox from '@/components/ScrollBox';
import { useElementAnimation } from '@/hooks/useElementAnimation';
import { usePersistentConfig } from '@/hooks/usePersistentConfig';
import { RestartAltOutlined } from '@mui/icons-material';
import { ToggleButtonGroupProps, Typography } from '@mui/material';
import { FileInfo } from '@shared';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { FILE_FILTER_OPTIONS, FILE_SORT_OPTIONS, FILE_TYPE_EXTS, FileFilterField, FileSortField } from '../constant';
import {
  StyledFileCountInfo,
  StyledFileGrid,
  StyledFileResetBtn,
  StyledFileToolRow,
  StyledSelectedBadge,
  StyledToggleButton,
  StyledToggleButtonGroup,
} from '../style/file-item-list';
import FileItem from './FileItem';

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
          showOrder && Array.isArray(value) ? (value?.findIndex((field: string) => field === item.value) ?? -1) + 1 : 0;

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

type FileSortMode = 'desc' | 'asc';

const DEFAULT_VALUES = {
  sortMode: 'desc' as FileSortMode,
  sortField: [] as FileSortField[],
  filterFileType: null,
  filterFileExts: [] as string[],
};

const FileItemList = ({ files }: FileItemListProps) => {
  const t = useTranslations();

  const reset = useElementAnimation<HTMLButtonElement>();

  const [sortMode, setSortMode] = usePersistentConfig<FileSortMode>(
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

  const handleReset = () => {
    setSortMode(DEFAULT_VALUES.sortMode);
    setSortField(DEFAULT_VALUES.sortField);
    setFilterFileType(DEFAULT_VALUES.filterFileType);
    setFilterFileExts(DEFAULT_VALUES.filterFileExts);
  };

  // 筛选和排序后的文件列表
  const filteredSortedFiles = useMemo(() => {
    return files;
  }, [files]);

  return (
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
            <StyledFileResetBtn
              ref={reset.domRef}
              onClick={() => {
                handleReset();
                reset.startByPreset('rotate360');
              }}
            >
              <RestartAltOutlined />
            </StyledFileResetBtn>

            <TBG
              exclusive
              value={sortMode}
              onChange={(_, value) => value && setSortMode(value)}
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
        <StyledFileCountInfo variant="body2">
          {files.length} / {filteredSortedFiles.length}
        </StyledFileCountInfo>
      }
    >
      {files.length && (
        <StyledFileGrid>
          {files.map(file => (
            <FileItem
              key={file.fullPath}
              file={file}
            />
          ))}
        </StyledFileGrid>
      )}
    </ResizeContainer>
  );
};

export default FileItemList;
