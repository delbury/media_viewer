import { useFileTitle } from '#/hooks/useFileTitle';
import { formatFileSize, getFilePosterUrl, stopPropagation } from '#/utils';
import { FileInfo } from '#pkgs/apis';
import { INFO_ID_FIELD } from '#pkgs/tools/common';
import { DeleteForeverRounded } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useTranslations } from 'next-intl';
import { MouseEventHandler, RefObject, useCallback, useMemo } from 'react';
import ScrollBox, { ScrollBoxInstance } from '../ScrollBox';
import { VirtualListChildItemProps } from '../ScrollBox/hooks/useVirtualList';
import {
  FILE_ITEM_ROW_HEIGHT,
  StyleChildItemDelete,
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
  onImgClick?: (file: FileInfo, index: number) => void;
  // 删除
  onItemDelete?: (file: FileInfo, index: number) => void;
  rowHeight?: number;
  // 额外信息组件
  RowExtraComp?: React.FC<{ file: FileInfo }>;

  isLoading?: boolean;
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
    onImgClick,
    rowHeight,
    RowExtraComp,
    onItemDelete,
  } = props;
  const file = files?.[index] as FileInfo;
  const posterUrl = useMemo(() => getFilePosterUrl(file), [file]);
  const handleItemClick = useCallback(() => onItemClick?.(file, index), [file, index, onItemClick]);
  const { title, secondaryTitle } = useFileTitle({ file });

  const activated = index === selectedIndex || selectedIdSet?.has(file[INFO_ID_FIELD]);
  const isSelectedFileSibling = isSibling?.(files ?? [], index, selectedIndex);
  const size = useMemo(() => formatFileSize(file.size), [file]);

  const handleImgClick = useCallback<MouseEventHandler<HTMLDivElement>>(
    ev => {
      if (onImgClick) stopPropagation(ev);
      onImgClick?.(file, index);
    },
    [file, index, onImgClick]
  );

  const handleItemDelete = useCallback<MouseEventHandler<HTMLButtonElement>>(
    ev => {
      if (onItemDelete) stopPropagation(ev);
      onItemDelete?.(file, index);
    },
    [file, index, onItemDelete]
  );

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
        <StyleChildItemImage onClick={handleImgClick}>
          <img
            src={posterUrl}
            alt={title}
            style={{
              cursor: onImgClick ? 'pointer' : void 0,
            }}
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

        {onItemDelete && (
          <StyleChildItemDelete>
            <IconButton onClick={handleItemDelete}>
              <DeleteForeverRounded fontSize="small" />
            </IconButton>
          </StyleChildItemDelete>
        )}
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
  onImgClick,
  onItemDelete,
  rowHeight,
  RowExtraComp,
  isLoading,
}: FileListPreviewerProps) => {
  const t = useTranslations();
  const defaultScroll = FILE_ITEM_ROW_HEIGHT * ((selectedIndex ?? 0) - 0.5);

  const getChildProps = useCallback(
    (index: number) => ({
      key: files?.[index]?.[INFO_ID_FIELD] ?? '',
      files,
      selectedIndex,
      selectedIdSet,
      isSibling,
      onItemClick,
      onImgClick,
      onItemDelete,
      rowHeight,
      RowExtraComp,
    }),
    [
      files,
      selectedIndex,
      selectedIdSet,
      isSibling,
      onItemClick,
      onImgClick,
      onItemDelete,
      rowHeight,
      RowExtraComp,
    ]
  );

  return (
    <ScrollBox
      ref={scrollBoxRef}
      sx={{ height: '100%' }}
      emptyText={t('Tools.NoFiles')}
      isEmpty={!files?.length}
      isLoading={isLoading}
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
