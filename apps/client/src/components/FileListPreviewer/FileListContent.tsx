import { useFileTitle } from '#/hooks/useFileTitle';
import { formatFileSize, getFilePosterUrl } from '#/utils';
import { FileInfo } from '#pkgs/apis';
import { useTranslations } from 'next-intl';
import { RefObject, useCallback, useMemo } from 'react';
import { VirtualListChildItemProps } from '../ScrollBox/hooks/useVirtualList';
import ScrollBox, { ScrollBoxInstance } from './../ScrollBox/index';
import {
  FILE_ITEM_ROW_HEIGHT,
  StyleChildItemDir,
  StyleChildItemImage,
  StyleChildItemInfo,
  StyleChildItemName,
  StyleChildItemNameRow,
  StyleChildItemSize,
  StyledChildItem,
} from './style';

interface FileListPreviewerProps {
  currentFileIndex?: number;
  files?: FileInfo[];
  scrollBoxRef?: RefObject<ScrollBoxInstance | null>;
  onItemClick?: (file: FileInfo, index: number) => void;
}

type ChildItemProps = FileListPreviewerProps & VirtualListChildItemProps;

const ChildItem = (props: ChildItemProps) => {
  const {
    index,
    files,
    currentFileIndex,
    onItemClick,
    params: { offsetY },
  } = props;
  const file = files?.[index] as FileInfo;
  const posterUrl = useMemo(() => getFilePosterUrl(file), [file]);
  const activated = index === currentFileIndex;
  const handleItemClick = useCallback(() => onItemClick?.(file, index), [file, index, onItemClick]);
  const { title, secondaryTitle } = useFileTitle({ file });
  const isSibling = files?.[currentFileIndex as number].showDir === files?.[index].showDir;
  const size = useMemo(() => formatFileSize(file.size), [file]);

  return (
    <StyledChildItem
      sx={{
        transform: `translateY(${offsetY}px)`,
      }}
      type={activated ? 'activated' : isSibling ? 'sibling' : void 0}
      onClick={handleItemClick}
    >
      <StyleChildItemImage>
        <img
          src={posterUrl}
          alt={title}
        />
      </StyleChildItemImage>
      <StyleChildItemInfo>
        <StyleChildItemNameRow>
          <StyleChildItemName>{title}</StyleChildItemName>
          <StyleChildItemSize>{size}</StyleChildItemSize>
        </StyleChildItemNameRow>
        <StyleChildItemDir>{secondaryTitle}</StyleChildItemDir>
      </StyleChildItemInfo>
    </StyledChildItem>
  );
};

const FileListContent = ({
  files,
  currentFileIndex,
  scrollBoxRef,
  onItemClick,
}: FileListPreviewerProps) => {
  const t = useTranslations();
  const defaultScroll = FILE_ITEM_ROW_HEIGHT * ((currentFileIndex ?? 0) - 0.5);

  const getChildProps = useCallback(
    (index: number) => ({
      key: files?.[index]?.showPath ?? '',
      files,
      currentFileIndex,
      onItemClick,
    }),
    [currentFileIndex, files, onItemClick]
  );

  return (
    <ScrollBox
      ref={scrollBoxRef}
      sx={{ height: '100%' }}
      emptyText={t('Tools.NoFiles')}
      isEmpty={!files?.length}
      lazyLoadEnabled={true}
      defaultScroll={{
        top: defaultScroll,
      }}
      virtualListConfig={{
        childCount: files?.length ?? 0,
        childHeight: FILE_ITEM_ROW_HEIGHT,
        ChildItem,
        getChildProps,
      }}
    />
  );
};

export default FileListContent;
