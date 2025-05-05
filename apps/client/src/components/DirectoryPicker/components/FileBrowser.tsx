'use client';

import ResizeContainer from '#/components/ResizeContainer';
import { useSwr } from '#/hooks/useSwr';
import { DirectoryInfo } from '#pkgs/apis';
import { Box } from '@mui/material';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import DirectoryItemList from './DirectoryItemList';
import FileItemList from './FileItemList';
import SelectingPathInfo from './SelectingPathInfo';

export interface FileBrowserInstance {
  updatePathList: (list: DirectoryInfo[]) => void;
}

interface FileBrowserProps {
  onPathNodeChange?: (node?: DirectoryInfo) => void;
  onPathListChange?: (nodes: DirectoryInfo[]) => void;
}

const FileBrowser = forwardRef<FileBrowserInstance, FileBrowserProps>(
  ({ onPathNodeChange, onPathListChange }, ref) => {
    // 请求文件夹树
    const dirRequest = useSwr('dirTree', {
      onSuccess: res => {
        setPathList(res.data ? [res.data] : []);
      },
    });
    const [pathList, setPathList] = useState<DirectoryInfo[]>(
      dirRequest.data ? [dirRequest.data] : []
    );

    // 当前目录下的子文件夹
    const currentPathNode = useMemo(() => pathList[pathList.length - 1], [pathList]);
    const currentDirs = useMemo(() => currentPathNode?.children ?? [], [currentPathNode]);
    const currentFiles = useMemo(() => currentPathNode?.files ?? [], [currentPathNode]);

    useEffect(() => onPathNodeChange?.(currentPathNode), [currentPathNode, onPathNodeChange]);
    useEffect(() => onPathListChange?.(pathList), [pathList, onPathListChange]);

    // 设置当前已选文件夹
    const setTarget = useCallback(
      (index: number) => {
        setPathList(pathList.slice(0, index + 1));
      },
      [pathList]
    );

    const handleSelectChild = useCallback(
      (dir: DirectoryInfo) => {
        setPathList([...pathList, dir]);
      },
      [pathList]
    );

    useImperativeHandle(
      ref,
      () => ({
        updatePathList: (list: DirectoryInfo[]) => setPathList(list),
      }),
      []
    );

    return (
      <Box>
        {/* 已选文件夹 */}
        <SelectingPathInfo
          pathList={pathList}
          onItemClick={setTarget}
        />
        <ResizeContainer.Wrapper height="60vh">
          {/* 当前文件夹的子文件夹 */}
          <DirectoryItemList
            dirs={currentDirs}
            onClick={handleSelectChild}
          />
          {/* 当前文件夹的文件 */}
          <FileItemList files={currentFiles} />
        </ResizeContainer.Wrapper>
      </Box>
    );
  }
);

FileBrowser.displayName = 'FileBrowser';

export default FileBrowser;
