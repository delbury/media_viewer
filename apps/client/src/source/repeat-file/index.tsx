'use client';

import DirectoryPicker from '#/components/DirectoryPicker';
import { FILE_SORT_API_FIELD_MAP, FILE_SORT_OPTIONS } from '#/components/DirectoryPicker/constant';
import { useSortList } from '#/components/DirectoryPicker/hooks/useSortList';
import { FileListContent } from '#/components/FileListPreviewer';
import { DirectoryInfo } from '#pkgs/apis';
import { getAllFiles } from '#pkgs/tools/common';
import { useMemo, useState } from 'react';
import FileExtraInfo from './components/FileExtraInfo';
import SelectedDirInfo from './components/SelectedDirInfo';
import { StyledFileContentContainer, StyledRepeatFileWrapper } from './style';

const ROW_HEIGHT = 72;

export default function RepeatFile() {
  const [currentDir, setCurrentDir] = useState<DirectoryInfo>();

  // 所有文件
  const files = useMemo(() => {
    const list = currentDir ? getAllFiles('video', currentDir) : [];
    return list;
  }, [currentDir]);

  // 排序
  const { sortedItems, SortToolRow } = useSortList({
    items: files,
    apiFieldMap: FILE_SORT_API_FIELD_MAP,
    persistentKeyPrefix: 'toolRepeatFiles',
    fileSortOptions: FILE_SORT_OPTIONS,
  });

  return (
    <StyledRepeatFileWrapper>
      <DirectoryPicker
        defaultVisible
        onCurrentDirChange={setCurrentDir}
        storageKeySuffix="RepeatFile"
      />

      <SelectedDirInfo files={sortedItems} />

      {SortToolRow}

      <StyledFileContentContainer>
        <FileListContent
          files={sortedItems}
          RowExtraComp={FileExtraInfo}
          rowHeight={ROW_HEIGHT}
        />
      </StyledFileContentContainer>
    </StyledRepeatFileWrapper>
  );
}
