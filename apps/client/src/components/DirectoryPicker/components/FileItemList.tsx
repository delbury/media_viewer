import { Stack } from '@mui/material';
import { FileInfo } from '@shared';
import FileItem from './FileItem';

interface FileItemListProps {
  files: FileInfo[];
}

const FileItemList = ({ files }: FileItemListProps) => {
  return (
    <>
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
    </>
  );
};

export default FileItemList;
