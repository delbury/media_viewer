'use client';

import ErrorBoundary from '#/components/ErrorBoundary';
import ResizeContainer from '#/components/ResizeContainer';
import { ScrollBoxInstance } from '#/components/ScrollBox';
import { useCustomEvent } from '#/hooks/useCustomEvent';
import { useMediaViewerContext } from '#/hooks/useMediaViewerContext';
import { useSwr } from '#/hooks/useSwr';
import { createHash, generateUrlWithSearch } from '#/utils';
import { HASH_QUERY_KEY, VIEWER_QUERY_KEY } from '#/utils/constant';
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

const createKey = (dir?: DirectoryInfo) => createHash(dir?.showPath);
const createHistoryParams = (hash: string) => {
  const params = new URLSearchParams(window.location.search);
  if (params.get(HASH_QUERY_KEY) !== hash) {
    params.set(HASH_QUERY_KEY, hash);
    return generateUrlWithSearch(params);
  }
};
const pushHistory = (hash: string) => {
  const url = createHistoryParams(hash);
  if (url) window.history.pushState({ [HASH_QUERY_KEY]: hash }, '', url);
};

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

    // 滚动容器元素
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
        const key = createKey(lastPathNode.current);
        const offset = scrollBoxRef.current.getScrollPosition()?.top ?? 0;
        scrollCaches.current.set(key, offset);
      }
      lastPathNode.current = currentPathNode;
    }, [currentPathNode]);

    // 还原滚动距离
    useEffect(() => {
      if (!currentPathNode || !scrollBoxRef.current) return;

      const key = createKey(currentPathNode);
      const offset = scrollCaches.current.get(key);
      if (offset) scrollBoxRef.current.scrollTo({ top: offset, behavior: 'instant' });
    }, [currentPathNode]);

    // 媒体浏览器
    const { closeMediaViewer } = useMediaViewerContext();

    // 绑定全局自定义事件
    const { on } = useCustomEvent();
    useEffect(() => {
      return on('customFilePathChange', evData => {
        if (!evData) return;
        // 当前的文件夹
        const currentDir = dirRequest.data;
        const newPathList: DirectoryInfo[] = [];
        // 查找新路径
        for (const dirName of evData) {
          const pathNode = currentDir?.children.find(c => c.name === dirName);
          if (pathNode) newPathList.push(pathNode);
          else return closeMediaViewer();
        }
        setPathList(curPathList => {
          closeMediaViewer();
          // 判断是否和现在的路径不相同
          if (
            curPathList.length !== newPathList.length ||
            newPathList.some((npl, i) => npl.name !== curPathList[i].name)
          ) {
            return newPathList;
          }
          return curPathList;
        });
      });
    }, [closeMediaViewer, dirRequest, on]);

    // 拦截浏览器返回事件
    useEffect(() => {
      const controller = new AbortController();
      // 拦截浏览器返回
      window.addEventListener(
        'popstate',
        () => {
          // 关闭 viewer
          if (window.history.state[VIEWER_QUERY_KEY]) {
            window.history.replaceState(
              {
                ...window.history.state,
                [VIEWER_QUERY_KEY]: void 0,
              },
              '',
              window.location.href
            );
            return closeMediaViewer();
          }

          // 返回上一个文件夹
          setPathList(curList => {
            // 不为根目录，返回上一级
            if (curList.length > 1) {
              window.setTimeout(() => {
                closeMediaViewer();
              });
              return curList.slice(0, curList.length - 1);
            }
            return curList;
          });
        },
        { signal: controller.signal }
      );
      return () => {
        controller.abort();
      };
    }, [closeMediaViewer]);

    // 插入 history
    useEffect(() => {
      const hash = createKey(currentPathNode);
      if (window.history.state[HASH_QUERY_KEY] !== hash) {
        pushHistory(hash);
      }
    }, [currentPathNode]);

    // 外部强制更新
    useImperativeHandle(
      ref,
      () => ({
        updatePathList: (list: DirectoryInfo[]) => {
          setPathList(list);
        },
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
          <ErrorBoundary>
            <DirectoryItemList
              dirs={currentDirs}
              onClick={handleSelectChild}
              storageKeySuffix={storageKeySuffix}
              scrollBoxProps={{
                ref: scrollBoxRef,
              }}
            />
          </ErrorBoundary>

          {/* 当前文件夹的文件 */}
          <ErrorBoundary>
            <FileItemList
              dir={currentPathNode}
              files={currentFiles}
              storageKeySuffix={storageKeySuffix}
            />
          </ErrorBoundary>
        </ResizeContainer.Wrapper>
      </StyledFileBrowserWrapper>
    );
  }
);

FileBrowser.displayName = 'FileBrowser';

export default FileBrowser;
