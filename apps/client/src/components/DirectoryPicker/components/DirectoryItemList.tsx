import { List } from '@mui/material';
import { DirectoryInfo } from '@shared';
import DirectoryItem from './DirectoryItem';

interface DirectoryItemListProps {
  dirs: DirectoryInfo[];
  onClick?: (dir: DirectoryInfo) => void;
}

const DirectoryItemList = ({ dirs, onClick }: DirectoryItemListProps) => {
  return (
    <>
      {dirs.length && (
        <List sx={{ padding: 0 }}>
          {dirs.map(dir => (
            <DirectoryItem
              key={dir.fullPath}
              dir={dir}
              onClick={() => onClick?.(dir)}
            />
          ))}
        </List>
      )}
    </>
  );
};

export default DirectoryItemList;
