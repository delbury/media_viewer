'use client';

import ResizeContainer from '#/components/ResizeContainer';
import { ScrollBoxInstance } from '#/components/ScrollBox';
import { useSwr } from '#/hooks/useSwr';
import { DirectoryInfo } from '#pkgs/apis';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyledFileBrowserWrapper } from '../style/file-browser';
import DirectoryItemList from './DirectoryItemList';
import FileItemList from './FileItemList';
import SelectingPathInfo from './SelectingPathInfo';

const getScrollCacheKey = (dir: DirectoryInfo) => `${dir.basePathIndex ?? ''}${dir.showPath}`;

export interface FileBrowserInstance {
  updatePathList: (list: DirectoryInfo[]) => void;
}

interface FileBrowserProps {
  storageKeySuffix?: string;
  height?: string;
  onPathNodeChange?: (node?: DirectoryInfo) => void;
  onPathListChange?: (nodes: DirectoryInfo[]) => void;
}

const FileBrowser = forwardRef<FileBrowserInstance, FileBrowserProps>(
  ({ height, storageKeySuffix, onPathNodeChange, onPathListChange }, ref) => {
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
    const currentPathNode = useMemo(() => pathList.at(-1), [pathList]);
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

    const scrollBoxRef = useRef<ScrollBoxInstance>(null);
    // 缓存滚动距离
    const scrollCaches = useRef(new Map<string, number>());
    // 上一个选中的文件夹节点
    const lastPathNode = useRef<DirectoryInfo>(null);

    // 设置滚动缓存
    useLayoutEffect(() => {
      if (!currentPathNode || !scrollBoxRef.current) return;
      if (lastPathNode.current) {
        // 有上一个文件夹，则保存滚动缓存
        const key = getScrollCacheKey(lastPathNode.current);
        const offset = scrollBoxRef.current.getScrollPosition()?.top ?? 0;
        scrollCaches.current.set(key, offset);
      }
      lastPathNode.current = currentPathNode;
    }, [currentPathNode]);

    // 还原滚动距离
    useEffect(() => {
      if (!currentPathNode || !scrollBoxRef.current) return;
      const key = getScrollCacheKey(currentPathNode);
      const offset = scrollCaches.current.get(key);
      if (offset) scrollBoxRef.current.scrollTo({ top: offset, behavior: 'instant' });
    }, [currentPathNode]);

    // 外部强制更新
    useImperativeHandle(
      ref,
      () => ({
        updatePathList: (list: DirectoryInfo[]) => setPathList(list),
      }),
      []
    );

    return (
      <StyledFileBrowserWrapper height={height || '100%'}>
        {/* 已选文件夹 */}
        <SelectingPathInfo
          pathList={pathList}
          onItemClick={setTarget}
          storageKeySuffix={storageKeySuffix}
        />
        <ResizeContainer.Wrapper>
          {/* 当前文件夹的子文件夹 */}
          <DirectoryItemList
            dirs={currentDirs}
            onClick={handleSelectChild}
            storageKeySuffix={storageKeySuffix}
            scrollBoxProps={{
              ref: scrollBoxRef,
            }}
          />
          {/* 当前文件夹的文件 */}
          <FileItemList
            files={currentFiles}
            storageKeySuffix={storageKeySuffix}
          />
        </ResizeContainer.Wrapper>
      </StyledFileBrowserWrapper>
    );
  }
);

FileBrowser.displayName = 'FileBrowser';

export default FileBrowser;
