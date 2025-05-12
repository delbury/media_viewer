import { getFilePosterUrl } from '#/utils';
import { FileInfo } from '#pkgs/apis';
import { FormatListBulletedRounded } from '@mui/icons-material';
import { Badge, IconButton } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import Dialog from '../Dialog';
import { VirtualListChildItemProps } from '../ScrollBox/hooks/useVirtualList';
import ScrollBox from './../ScrollBox/index';
import {
  FILE_ITEM_ROW_HEIGHT,
  StyleChildItemImage,
  StyleChildItemName,
  StyledChildItem,
  StyledListPreviewerWrapper,
  StyleFilesContainer,
} from './style';

interface FileListPreviewerProps {
  files?: FileInfo[];
}

const ChildItem = (props: { files?: FileInfo[] } & VirtualListChildItemProps) => {
  const { index, files } = props;
  const file = files?.[index];
  const posterUrl = useMemo(() => getFilePosterUrl(file), [file]);

  return (
    <StyledChildItem>
      <StyleChildItemImage>
        <img
          src={posterUrl}
          alt={file?.name}
        />
      </StyleChildItemImage>
      <StyleChildItemName>{file?.name}</StyleChildItemName>
    </StyledChildItem>
  );
};

const FileListPreviewer = ({ files }: FileListPreviewerProps) => {
  const t = useTranslations();
  const [visible, setVisible] = useState(false);
  const fileCount = useMemo(() => files?.length ?? 0, [files]);

  const handleOpen = useCallback(() => setVisible(true), []);
  const handleClose = useCallback(() => setVisible(false), []);

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
        >
          <StyleFilesContainer>
            <ScrollBox
              emptyText={t('Tools.NoFiles')}
              isEmpty={!files?.length}
              lazyLoadEnabled={true}
              virtualListConfig={{
                childCount: files?.length ?? 0,
                childHeight: FILE_ITEM_ROW_HEIGHT,
                ChildItem,
                getChildProps: (index: number) => ({
                  key: files?.[index]?.relativePath ?? '',
                  files,
                }),
              }}
            >
              xxx
            </ScrollBox>
          </StyleFilesContainer>
        </Dialog>
      )}
    </StyledListPreviewerWrapper>
  );
};

export default FileListPreviewer;
