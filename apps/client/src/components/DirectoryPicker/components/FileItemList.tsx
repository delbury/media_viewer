import ResizeContainer from '@/components/ResizeContainer';
import ScrollBox from '@/components/ScrollBox';
import { usePersistentConfig } from '@/hooks/usePersistentConfig';
import { RestartAltOutlined } from '@mui/icons-material';
import { Stack, ToggleButtonGroupProps, Typography } from '@mui/material';
import { FileInfo } from '@shared';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { FILE_FILTER_OPTIONS, FILE_SORT_OPTIONS, FILE_TYPE_EXTS, FileFilterField, FileSortField } from '../constant';
import {
  StyledFileResetBtn,
  StyledFileToolRow,
  StyledSelectedBadge,
  StyledToggleButton,
  StyledToggleButtonGroup,
} from '../style';
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

  return (
    <ResizeContainer
      height="20vh"
      // title={t('Tools.CurrentFiles')}
      emptyText={t('Tools.NoFiles')}
      isEmpty={!files.length}
      resizePosition="top"
      persistentKey="directoryPickerFiles"
      beforeContentSlot={
        <>
          <StyledFileToolRow>
            <StyledFileResetBtn onClick={handleReset}>
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
    >
      {files.length && (
        <Stack
          direction="row"
          gap={1}
          useFlexGap
          sx={{ flexWrap: 'wrap', padding: '4px' }}
        >
          {files.map(file => (
            <FileItem
              key={file.fullPath}
              file={file}
            />
          ))}
        </Stack>
      )}
    </ResizeContainer>
  );
};

export default FileItemList;
