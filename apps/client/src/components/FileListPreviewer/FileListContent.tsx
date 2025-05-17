import { useFileTitle } from '#/hooks/useFileTitle';
import { formatFileSize, getFilePosterUrl } from '#/utils';
import { FileInfo } from '#pkgs/apis';
import { FILE_INFO_ID_FIELD } from '#pkgs/tools/common';
import { useTranslations } from 'next-intl';
import { RefObject, useCallback, useMemo } from 'react';
import ScrollBox, { ScrollBoxInstance } from '../ScrollBox';
import { VirtualListChildItemProps } from '../ScrollBox/hooks/useVirtualList';
import {
  FILE_ITEM_ROW_HEIGHT,
  StyleChildItemDir,
  StyleChildItemImage,
  StyleChildItemInfo,
  StyleChildItemName,
  StyleChildItemNameRow,
  StyleChildItemSize,
  StyledChildItem,
  StyledChildItemInner,
} from './style';

interface FileListPreviewerProps {
  // 选中的文件 index
  selectedIndex?: number;
  selectedIdSet?: Set<string>;
  // 判断是否是选中文件的兄弟文件
  isSibling?: (files: FileInfo[], currentIndex: number, selectedIndex?: number) => boolean;
  files?: FileInfo[];
  scrollBoxRef?: RefObject<ScrollBoxInstance | null>;
  onItemClick?: (file: FileInfo, index: number) => void;
  rowHeight?: number;
  // 额外信息组件
  RowExtraComp?: React.FC<{ file: FileInfo }>;
}

type ChildItemProps = FileListPreviewerProps & VirtualListChildItemProps;

const ChildItem = (props: ChildItemProps) => {
  const {
    index,
    params: { offsetY },
    files,
    selectedIndex,
    selectedIdSet,
    isSibling,
    onItemClick,
    rowHeight,
    RowExtraComp,
  } = props;
  const file = files?.[index] as FileInfo;
  const posterUrl = useMemo(() => getFilePosterUrl(file), [file]);
  const handleItemClick = useCallback(() => onItemClick?.(file, index), [file, index, onItemClick]);
  const { title, secondaryTitle } = useFileTitle({ file });

  const activated = index === selectedIndex || selectedIdSet?.has(file[FILE_INFO_ID_FIELD]);
  const isSelectedFileSibling = isSibling?.(files ?? [], index, selectedIndex);
  const size = useMemo(() => formatFileSize(file.size), [file]);

  return (
    <StyledChildItem
      sx={{
        transform: `translateY(${offsetY}px)`,
        cursor: onItemClick ? 'pointer' : void 0,
        height: rowHeight ? `${rowHeight}px !important` : void 0,
      }}
      type={activated ? 'activated' : isSelectedFileSibling ? 'sibling' : void 0}
      onClick={handleItemClick}
    >
      <StyledChildItemInner>
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
          {RowExtraComp && <RowExtraComp file={file} />}
        </StyleChildItemInfo>
      </StyledChildItemInner>
    </StyledChildItem>
  );
};

const FileListContent = ({
  files,
  selectedIndex,
  selectedIdSet,
  isSibling,
  scrollBoxRef,
  onItemClick,
  rowHeight,
  RowExtraComp,
}: FileListPreviewerProps) => {
  const t = useTranslations();
  const defaultScroll = FILE_ITEM_ROW_HEIGHT * ((selectedIndex ?? 0) - 0.5);

  const getChildProps = useCallback(
    (index: number) => ({
      key: files?.[index]?.[FILE_INFO_ID_FIELD] ?? '',
      files,
      selectedIndex,
      selectedIdSet,
      isSibling,
      onItemClick,
      rowHeight,
      RowExtraComp,
    }),
    [files, selectedIndex, selectedIdSet, isSibling, onItemClick, rowHeight, RowExtraComp]
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
        childHeight: rowHeight ?? FILE_ITEM_ROW_HEIGHT,
        ChildItem,
        getChildProps,
      }}
    />
  );
};

export default FileListContent;
