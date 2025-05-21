'use client';

import FileDetailDialog from '#/components/DirectoryPicker/components/FileDetailDialog';
import { FileListContent } from '#/components/FileListPreviewer';
import ScrollBox from '#/components/ScrollBox';
import { useSwr } from '#/hooks/useSwr';
import { FileInfo } from '#pkgs/apis';
import { FILE_INFO_ID_FIELD } from '#pkgs/tools/common';
import { isNil } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';
import { StyledContent, StyledDirItem, StyledDirs, StyledDislikeListWrapper } from './style';

const DislikeList = () => {
  const [detailFile, setDetailFile] = useState<FileInfo | null>(null);
  const [selectedDir, setSelectedDir] = useState<string | null>(null);
  const listRequest = useSwr('mediaDislikeList');

  const selectedFileSet = useMemo(() => {
    const set = new Set<string>();
    listRequest.data?.list.forEach(it => {
      if (it.showDir === selectedDir) {
        set.add(it[FILE_INFO_ID_FIELD]);
      }
    });
    return set;
  }, [selectedDir, listRequest.data]);

  const dirs = useMemo(() => {
    const map = new Map<string, number>();
    listRequest.data?.list.forEach(it => {
      const val = map.get(it.showDir);
      if (isNil(val)) map.set(it.showDir, 1);
      else map.set(it.showDir, val + 1);
    });
    return [...map];
  }, [listRequest.data]);

  const handleImgClick = useCallback((file: FileInfo) => {
    setDetailFile(file);
  }, []);

  const handleItemClick = useCallback((file: FileInfo) => {
    setSelectedDir(v => (v === file.showDir ? null : file.showDir));
  }, []);

  const handleDirClick = useCallback((dir: string) => {
    setSelectedDir(v => (v === dir ? null : dir));
  }, []);

  return (
    <StyledDislikeListWrapper>
      <StyledDirs>
        <ScrollBox sx={{ height: '100%' }}>
          {dirs.map(d => (
            <StyledDirItem
              selected={selectedDir === d[0]}
              key={d[0]}
              onClick={() => handleDirClick(d[0])}
            >
              {/* <ContentCopyRounded fontSize="inherit" /> */}
              <span>{d[0]}</span>
              <span>{d[1]}</span>
            </StyledDirItem>
          ))}
        </ScrollBox>
      </StyledDirs>

      <StyledContent>
        <FileListContent
          files={listRequest.data?.list ?? []}
          onImgClick={handleImgClick}
          onItemClick={handleItemClick}
          isLoading={listRequest.isLoading}
          selectedIdSet={selectedFileSet}
        />
      </StyledContent>

      {detailFile && (
        <FileDetailDialog
          visible
          file={detailFile}
          onClose={() => setDetailFile(null)}
        />
      )}
    </StyledDislikeListWrapper>
  );
};

export default DislikeList;
