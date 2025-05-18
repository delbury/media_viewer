'use client';

import DirectoryPicker from '#/components/DirectoryPicker';
import { FILE_BROWSER_DIR_TREE_REQUEST_KEY } from '#/components/DirectoryPicker/components/FileBrowser';
import FileDetailDialog from '#/components/DirectoryPicker/components/FileDetailDialog';
import { FILE_SORT_API_FIELD_MAP, FILE_SORT_OPTIONS } from '#/components/DirectoryPicker/constant';
import { useSortList } from '#/components/DirectoryPicker/hooks/useSortList';
import { FileListContent } from '#/components/FileListPreviewer';
import { ScrollBoxInstance } from '#/components/ScrollBox';
import { useConfirmDialogByKeys } from '#/hooks/useConfirmDialog';
import { useSwrMutation } from '#/hooks/useSwr';
import { DirectoryInfo, FileInfo } from '#pkgs/apis';
import { FILE_INFO_ID_FIELD, getAllFiles } from '#pkgs/tools/common';
import { DeleteForeverRounded } from '@mui/icons-material';
import { Box, IconButton } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useRef, useState } from 'react';
import { mutate } from 'swr';
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
  // 已选中的文件id
  const [selectedSet, setSelectedSet] = useState(new Set<string>());
  // 保存文件 id => 文件信息
  const fileMap = useRef<Record<string, FileInfo>>({});
  // 显示的文件集合
  const [showFileGroup, setShowFileGroup] = useState<'selected' | 'all' | 'same'>('all');

  // 所有文件
  const [files, setFiles] = useState<FileInfo[]>([]);
  // 生成文件列表
  const handleCurrentDirChange = useCallback((currentDir?: DirectoryInfo) => {
    // 清空已选
    setSelectedSet(new Set());
    fileMap.current = {};
    const list = currentDir ? getAllFiles('video', currentDir) : [];
    setFiles(list);
  }, []);

  const scrollBoxRef = useRef<ScrollBoxInstance>(null);

  const { trigger: deleteTrigger } = useSwrMutation('fileDelete');
  // 删除操作
  const handleDelete = useCallback(async () => {
    const size = selectedSet.size;
    await deleteTrigger({
      data: {
        files: [...selectedSet].map(it => ({
          basePathIndex: fileMap.current[it].basePathIndex as number,
          relativePath: fileMap.current[it].relativePath,
        })),
      },
    });
    // 乐观更新本地列表
    setFiles(files => {
      const newFiles = files.filter(f => !fileMap.current[f[FILE_INFO_ID_FIELD]]);
      fileMap.current = {};
      return newFiles;
    });
    setSelectedSet(new Set());
    // 更新文件树
    await mutate(FILE_BROWSER_DIR_TREE_REQUEST_KEY);
  }, [deleteTrigger, selectedSet]);

  // 操作确认
  const { ConfirmDialog, openConfirmDialog } = useConfirmDialogByKeys({
    delete: {
      onOk: handleDelete,
      description: t('Tools.AreYouSureDeleteSelectedFiles'),
    },
  });

  // 排序
  const { sortedItems, SortToolRow, sortField } = useSortList({
    items: files,
    apiFieldMap: FILE_SORT_API_FIELD_MAP,
    persistentKeyPrefix: 'toolRepeatFiles',
    fileSortOptions: FILE_SORT_OPTIONS,
    // exclusive: true,
  });

  // 过滤
  const selectedItems = useMemo(() => {
    return sortedItems.filter(it => selectedSet.has(it[FILE_INFO_ID_FIELD]));
  }, [selectedSet, sortedItems]);

  // 只展示存在相同值的项
  const repeatItems = useMemo(() => {
    const sf = Array.isArray(sortField) ? sortField[0] : sortField;
    if (!sf) return [];

    const tempMap = new Map<string, Set<number>>();
    sortedItems.forEach((item, index) => {
      const key = item[sf];
      const set = tempMap.get(key);
      if (set) set.add(index);
      else tempMap.set(key, new Set([index]));
    });
    const resList: FileInfo[] = [];
    for (const set of tempMap.values()) {
      if (set.size > 1) {
        for (const i of set.values()) resList.push(sortedItems[i]);
      }
    }
    return resList;
  }, [sortField, sortedItems]);

  const realShowItem = useMemo(() => {
    if (showFileGroup === 'selected') return selectedItems;
    else if (showFileGroup === 'all') return sortedItems;
    else if (showFileGroup === 'same') return repeatItems;
  }, [selectedItems, repeatItems, showFileGroup, sortedItems]);

  const handleItemClick = useCallback((file: FileInfo) => {
    setSelectedSet(set => {
      const id = file[FILE_INFO_ID_FIELD];
      if (set.has(id)) {
        set.delete(id);
        Reflect.deleteProperty(fileMap.current, id);
      } else {
        set.add(id);
        fileMap.current[id] = file;
      }
      return new Set(set);
    });
  }, []);

  // 文件详情
  const [detailFile, setDetailFile] = useState<FileInfo | null>(null);
  const handleImgClick = useCallback((file: FileInfo) => {
    setDetailFile(file);
  }, []);

  return (
    <StyledRepeatFileWrapper>
      <DirectoryPicker
        defaultVisible
        onCurrentDirChange={handleCurrentDirChange}
        storageKeySuffix="RepeatFile"
      />

      {/* 信息行 */}
      <StyledSelectedDirInfoWrapper>
        <StyledSelectedDirInfo>
          <Box>
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
            <StyledFileGroupBtn
              selected={showFileGroup === 'same'}
              onClick={() => setShowFileGroup('same')}
            >
              {t('Tools.ExistRepeatItem')}
            </StyledFileGroupBtn>
          </Box>

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
      </StyledSelectedDirInfoWrapper>

      {SortToolRow}

      <StyledFileContentContainer>
        <FileListContent
          scrollBoxRef={scrollBoxRef}
          files={realShowItem}
          RowExtraComp={FileExtraInfo}
          rowHeight={ROW_HEIGHT}
          onItemClick={handleItemClick}
          onImgClick={handleImgClick}
          selectedIdSet={selectedSet}
        />
      </StyledFileContentContainer>

      {ConfirmDialog}

      {detailFile && (
        <FileDetailDialog
          visible
          file={detailFile}
          onClose={() => setDetailFile(null)}
        />
      )}
    </StyledRepeatFileWrapper>
  );
}
