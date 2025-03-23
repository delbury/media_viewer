import ResizeContainer from '@/components/ResizeContainer';
import { Stack } from '@mui/material';
import { FileInfo } from '@shared';
import { useTranslations } from 'next-intl';
import FileItem from './FileItem';

interface FileItemListProps {
  files: FileInfo[];
}

const FileItemList = ({ files }: FileItemListProps) => {
  const t = useTranslations();

  return (
    <ResizeContainer
      height="20vh"
      // title={t('Tools.CurrentFiles')}
      emptyText={t('Tools.NoFiles')}
      isEmpty={!files.length}
      resizePosition="top"
      persistentKey="directoryPickerFiles"
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
