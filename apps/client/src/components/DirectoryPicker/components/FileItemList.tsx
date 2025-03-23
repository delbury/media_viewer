import ResizeContainer from '@/components/ResizeContainer';
import ScrollBox from '@/components/ScrollBox';
import { usePersistentConfig } from '@/hooks/usePersistentConfig';
import { Box, Stack, ToggleButtonGroup, Typography } from '@mui/material';
import { FileInfo } from '@shared';
import { useTranslations } from 'next-intl';
import { FILE_SORT_OPTIONS, FileSortField } from '../constant';
import { StyledToggleButton } from '../style';
import FileItem from './FileItem';

interface FileItemListProps {
  files: FileInfo[];
}

type FileSortMode = 'desc' | 'asc';

const FileItemList = ({ files }: FileItemListProps) => {
  const t = useTranslations();

  const [sortMode, setSortMode] = usePersistentConfig<FileSortMode>('desc', 'directoryPickerFilesSortMode');
  const [sortField, setSortField] = usePersistentConfig<FileSortField>('name', 'directoryPickerFilesSortField');

  return (
    <ResizeContainer
      height="20vh"
      // title={t('Tools.CurrentFiles')}
      emptyText={t('Tools.NoFiles')}
      isEmpty={!files.length}
      resizePosition="top"
      persistentKey="directoryPickerFiles"
      beforeContentSlot={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', pb: '4px' }}>
          <ToggleButtonGroup
            color="primary"
            exclusive
            value={sortMode}
            onChange={(_, value) => value && setSortMode(value)}
            size="small"
            sx={{ height: '24px' }}
          >
            <StyledToggleButton value="desc">
              <Typography variant="body2">{t('Common.Desc')}</Typography>
            </StyledToggleButton>
            <StyledToggleButton value="asc">
              <Typography variant="body2">{t('Common.Asc')}</Typography>
            </StyledToggleButton>
          </ToggleButtonGroup>
          <ScrollBox>
            <ToggleButtonGroup
              color="primary"
              exclusive
              value={sortField}
              onChange={(_, value) => value && setSortField(value)}
              size="small"
              sx={{ height: '24px' }}
            >
              {FILE_SORT_OPTIONS.map(opt => (
                <StyledToggleButton
                  key={opt.value}
                  value={opt.value}
                >
                  <Typography variant="body2"> {t(opt.label)}</Typography>
                </StyledToggleButton>
              ))}
            </ToggleButtonGroup>
          </ScrollBox>
        </Box>
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
