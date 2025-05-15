'use client';

import DirectoryPicker from '#/components/DirectoryPicker';
import { FILE_SORT_API_FIELD_MAP, FILE_SORT_OPTIONS } from '#/components/DirectoryPicker/constant';
import { useSortList } from '#/components/DirectoryPicker/hooks/useSortList';
import { FileListContent } from '#/components/FileListPreviewer';
import { useConfirmDialogByKeys } from '#/hooks/useConfirmDialog';
import { FILE_INFO_ID_FIELD } from '#/utils/constant';
import { DirectoryInfo, FileInfo } from '#pkgs/apis';
import { getAllFiles } from '#pkgs/tools/common';
import { DeleteForeverRounded } from '@mui/icons-material';
import { Box, Divider, IconButton } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import FileExtraInfo from './components/FileExtraInfo';
import {
  StyledFileContentContainer,
  StyledFileGroupBtn,
  StyledRepeatFileWrapper,
  StyledSelectedDirInfo,
  StyledSelectedDirInfoWrapper,
} from './style';

const ROW_HEIGHT = 72;

export default function RepeatFile() {
  const t = useTranslations();
  const [currentDir, setCurrentDir] = useState<DirectoryInfo>();
  // 已选中的文件
  const [selectedSet, setSelectedSet] = useState(new Set<string>());
  // 显示的文件集合
  const [showFileGroup, setShowFileGroup] = useState<'selected' | 'all'>('all');

  // 所有文件
  const files = useMemo(() => {
    // 清空已选
    setSelectedSet(new Set());

    const list = currentDir ? getAllFiles('video', currentDir) : [];
    return list;
  }, [currentDir]);

  // 删除操作
  const handleDelete = useCallback(() => {
    //
  }, [selectedSet]);

  // 操作确认
  const { ConfirmDialog, openConfirmDialog } = useConfirmDialogByKeys({
    delete: {
      onOk: handleDelete,
      description: t('Tools.AreYouSureDeleteSelectedFiles'),
    },
  });

  // 排序
  const { sortedItems, SortToolRow } = useSortList({
    items: files,
    apiFieldMap: FILE_SORT_API_FIELD_MAP,
    persistentKeyPrefix: 'toolRepeatFiles',
    fileSortOptions: FILE_SORT_OPTIONS,
    exclusive: true,
  });

  // 过滤
  const filteredItems = useMemo(() => {
    if (showFileGroup === 'selected')
      return sortedItems.filter(it => selectedSet.has(it[FILE_INFO_ID_FIELD]));
    else return sortedItems;
  }, [selectedSet, showFileGroup, sortedItems]);

  const handleItemClick = useCallback((file: FileInfo) => {
    setSelectedSet(set => {
      const id = file[FILE_INFO_ID_FIELD];
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return new Set(set);
    });
  }, []);

  return (
    <StyledRepeatFileWrapper>
      <DirectoryPicker
        defaultVisible
        onCurrentDirChange={setCurrentDir}
        storageKeySuffix="RepeatFile"
      />

      {/* 信息行 */}
      <StyledSelectedDirInfoWrapper>
        <StyledSelectedDirInfo>
          <span>
            <StyledFileGroupBtn
              selected={showFileGroup === 'all'}
              onClick={() => setShowFileGroup('all')}
            >
              {t('Common.Video')}
              {t(':')}
              {sortedItems.length}
            </StyledFileGroupBtn>
            <StyledFileGroupBtn
              selected={showFileGroup === 'selected'}
              onClick={() => setShowFileGroup('selected')}
            >
              {t('Common.Selected')}
              {t(':')}
              {selectedSet.size}
            </StyledFileGroupBtn>
          </span>

          <Box>
            <IconButton
              size="small"
              disabled={!selectedSet.size}
              onClick={() => openConfirmDialog('delete')}
            >
              <DeleteForeverRounded fontSize="small" />
            </IconButton>
          </Box>
        </StyledSelectedDirInfo>
        <Divider />
      </StyledSelectedDirInfoWrapper>

      {SortToolRow}

      <StyledFileContentContainer>
        <FileListContent
          files={filteredItems}
          RowExtraComp={FileExtraInfo}
          rowHeight={ROW_HEIGHT}
          onItemClick={handleItemClick}
          selectedIdSet={selectedSet}
        />
      </StyledFileContentContainer>

      {ConfirmDialog}
    </StyledRepeatFileWrapper>
  );
}
