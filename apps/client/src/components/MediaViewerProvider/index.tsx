'use client';

import { useCustomEvent } from '#/hooks/useCustomEvent';
import { generateUrlWithSearch } from '#/utils';
import { VIEWER_QUERY_KEY, ViewerQueryValue } from '#/utils/constant';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AudioViewer from '../AudioViewer';
import FileDetailDialog from '../DirectoryPicker/components/FileDetailDialog';
import FileListPreviewer from '../FileListPreviewer';
import ImageViewer from '../ImageViewer';
import VideoViewer from '../VideoViewer';
import { INIT_VALUE, MediaContext, MediaContextState } from './Context';
import { useFileOrDirectory } from './useFileOrDirectory';

const MediaViewerProvider = ({ children }: { children?: React.ReactNode }) => {
  const [state, setState] = useState(INIT_VALUE);

  const show = useMemo(() => {
    const flags: Partial<Record<NonNullable<MediaContextState['mediaType']>, boolean>> = {};
    if (!state.file && !state.dir && !state.list?.length) return flags;
    if (state.mediaType) flags[state.mediaType] = true;
    return flags;
  }, [state.dir, state.file, state.list, state.mediaType]);

  const {
    fileList,
    currentFile,
    currentFileIndex,
    isList,
    goNextFile,
    goPrevFile,
    lastDisabled,
    firstDisabled,
    toggleRandom,
    isRandomPlay,
  } = useFileOrDirectory({
    file: state.file,
    dir: state.dir,
    list: state.list,
    mediaType: state.mediaType,
  });
  const [detailVisible, setDetailVisible] = useState(false);

  const value = useMemo(
    () => ({
      state,
      setState,
      goNextFile,
    }),
    [goNextFile, state]
  );

  // 用于拦截浏览器返回上一个历史记录
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!show.audio && !show.image && !show.video) {
      // 关闭时
      setDetailVisible(false);
      params.delete(VIEWER_QUERY_KEY);
      // 如果是正常关闭，则需要移除这条历史
      if (window.history.state[VIEWER_QUERY_KEY] === ViewerQueryValue.Current) {
        window.history.go(-1);
      }
    } else {
      // 打开时
      params.set(VIEWER_QUERY_KEY, 'true');
      // 替换当前记录，标记为打开过 viewer
      window.history.replaceState(
        { ...window.history.state, [VIEWER_QUERY_KEY]: ViewerQueryValue.Prev },
        '',
        window.location.href
      );
      // viewer 打开，插入一条新纪录
      window.history.pushState(
        {
          ...window.history.state,
          [VIEWER_QUERY_KEY]: ViewerQueryValue.Current,
        },
        '',
        generateUrlWithSearch(params)
      );
    }
  }, [show]);

  // 标题点击
  const handleTitleClick = useCallback(() => {
    setDetailVisible(true);
  }, []);

  const { emit } = useCustomEvent();
  // 文件详情的路径点击
  const handleDetailPathClick = useCallback(
    (paths: string[]) => {
      emit('customFilePathChange', paths);
    },
    [emit]
  );

  const handleClose = useCallback(() => {
    setState(INIT_VALUE);
  }, []);

  return (
    <MediaContext.Provider value={value}>
      {children}

      {show.image && (
        <ImageViewer
          visible
          file={currentFile}
          isList={isList}
          lastDisabled={lastDisabled}
          firstDisabled={firstDisabled}
          isRandomPlay={isRandomPlay}
          onNext={goNextFile}
          onPrev={goPrevFile}
          onToggleRandom={toggleRandom}
          onClose={handleClose}
          onTitleClick={handleTitleClick}
          headerLeftSlot={
            isList && (
              <FileListPreviewer
                files={fileList}
                currentFileIndex={currentFileIndex}
              />
            )
          }
        />
      )}

      {show.audio && (
        <AudioViewer
          visible
          file={currentFile}
          isList={isList}
          lastDisabled={lastDisabled}
          firstDisabled={firstDisabled}
          isRandomPlay={isRandomPlay}
          onNext={goNextFile}
          onPrev={goPrevFile}
          onToggleRandom={toggleRandom}
          onClose={handleClose}
          onTitleClick={handleTitleClick}
          headerLeftSlot={
            isList && (
              <FileListPreviewer
                files={fileList}
                currentFileIndex={currentFileIndex}
              />
            )
          }
        />
      )}

      {show.video && (
        <VideoViewer
          visible
          file={currentFile}
          isList={isList}
          lastDisabled={lastDisabled}
          firstDisabled={firstDisabled}
          isRandomPlay={isRandomPlay}
          onNext={goNextFile}
          onPrev={goPrevFile}
          onToggleRandom={toggleRandom}
          onClose={handleClose}
          onTitleClick={handleTitleClick}
          headerLeftSlot={
            isList && (
              <FileListPreviewer
                files={fileList}
                currentFileIndex={currentFileIndex}
              />
            )
          }
        />
      )}

      {detailVisible && currentFile && (
        <FileDetailDialog
          file={currentFile}
          visible
          onClose={() => setDetailVisible(false)}
          hidePoster
          onPathClick={handleDetailPathClick}
        />
      )}
    </MediaContext.Provider>
  );
};

export default MediaViewerProvider;
