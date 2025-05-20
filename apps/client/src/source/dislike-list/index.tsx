'use client';

import FileDetailDialog from '#/components/DirectoryPicker/components/FileDetailDialog';
import { FileListContent } from '#/components/FileListPreviewer';
import { useSwr } from '#/hooks/useSwr';
import { FileInfo } from '#pkgs/apis';
import { isNil } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';
import { StyledContent, StyledDirItem, StyledDirs, StyledDislikeListWrapper } from './style';

const DislikeList = () => {
  const [detailFile, setDetailFile] = useState<FileInfo | null>(null);
  const listRequest = useSwr('mediaDislikeList');

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

  return (
    <StyledDislikeListWrapper>
      <StyledDirs>
        {dirs.map(d => (
          <StyledDirItem key={d[0]}>
            {/* <ContentCopyRounded fontSize="inherit" /> */}
            <span>{d[0]}</span>
            <span>{d[1]}</span>
          </StyledDirItem>
        ))}
      </StyledDirs>

      <StyledContent>
        <FileListContent
          files={listRequest.data?.list ?? []}
          onImgClick={handleImgClick}
          isLoading={listRequest.isLoading}
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
