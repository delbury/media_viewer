'use client';

import Dialog from '@/components/Dialog';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useDialogState } from '@/hooks/useDialogState';
import { DirectoryInfo, useSwr } from '@/hooks/useSwr';
import { LoopOutlined } from '@mui/icons-material';
import { Box, Button, IconButton, List, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ErrorBoundary from '../ErrorBoundary';
import ResizeContainer from '../ResizeContainer';
import DirectoryItem from './DirectoryItem';
import DirectoryPath from './DirectoryPath';
import FileItem from './FileItem';
import FilesInfo from './FilesInfo';

export default function DirectoryPicker() {
  const t = useTranslations();
  const { visible, handleClose, handleOpen } = useDialogState(true);

  // 后端强制更新文件信息
  const updateRequest = useSwr('dirUpdate', { lazy: true });
  // 二次确认是否刷新
  const { dialog: confirmDialog, handleOpen: confirmOpen } = useConfirmDialog(updateRequest.refresh);

  // 请求文件夹树
  const dirRequest = useSwr('dirTree');
  // example: /a/b/c
  const [pathList, setPathList] = useState<DirectoryInfo[]>([]);
  // 当前目录下的子文件夹
  const currentPathNode = useMemo(() => pathList[pathList.length - 1], [pathList]);
  const currentDirs = useMemo(() => currentPathNode?.children ?? [], [currentPathNode]);
  const currentFiles = useMemo(() => currentPathNode?.files ?? [], [currentPathNode]);
  const currentTotalFileCount = useMemo(() => currentPathNode?.totalFilesCount ?? 0, [currentPathNode]);
  const currentSelfFileCount = useMemo(() => currentPathNode?.selfFilesCount ?? 0, [currentPathNode]);

  // 设置当前已选文件夹
  const setTarget = (index: number) => {
    setPathList(pathList.slice(0, index + 1));
  };
  // 初始化数据
  useEffect(() => {
    setPathList(dirRequest.data ? [dirRequest.data] : []);
  }, [dirRequest.data]);
  useEffect(() => {
    setPathList(updateRequest.data?.treeNode ? [updateRequest.data.treeNode] : []);
  }, [updateRequest.data]);

  const handleSelectChild = (dir: DirectoryInfo) => {
    setPathList([...pathList, dir]);
  };

  const handleOk = useCallback(() => {
    handleClose();
  }, [handleClose]);

  return (
    <ErrorBoundary>
      <Box>
        <Button
          variant="contained"
          size="small"
          onClick={handleOpen}
        >
          {t('Tools.SelectDirectory')}
        </Button>

        {visible && (
          <Dialog
            open={visible}
            onClose={handleClose}
            onOk={handleOk}
            title={t('Tools.SelectDirectory')}
            titleRightSlot={
              <FilesInfo
                total={currentTotalFileCount}
                self={currentSelfFileCount}
              />
            }
            leftFooterSlot={
              <IconButton
                loading={updateRequest.isLoading}
                onClick={confirmOpen}
              >
                <LoopOutlined />
              </IconButton>
            }
          >
            {/* 已选文件夹 */}
            <DirectoryPath
              pathList={pathList}
              onItemClick={setTarget}
            />
            <ResizeContainer.Wrapper height="50vh">
              {/* 当前文件夹的子文件夹 */}
              <ResizeContainer
                title={t('Tools.CurrentDirectories')}
                emptyText={t('Tools.NoDirectories')}
                isEmpty={!currentDirs.length}
              >
                {currentDirs.length && (
                  <List sx={{ padding: 0 }}>
                    {currentDirs.map(dir => (
                      <DirectoryItem
                        key={dir.fullPath}
                        dir={dir}
                        onClick={() => handleSelectChild(dir)}
                      />
                    ))}
                  </List>
                )}
              </ResizeContainer>

              {/* 当前文件夹的文件 */}
              <ResizeContainer
                height="20vh"
                title={t('Tools.CurrentFiles')}
                emptyText={t('Tools.NoFiles')}
                isEmpty={!currentFiles.length}
                resizePosition="top"
                persistentKey="directoryPickerFiles"
              >
                {currentFiles.length && (
                  <Stack
                    direction="row"
                    gap={1}
                    useFlexGap
                    sx={{ flexWrap: 'wrap', padding: '4px' }}
                  >
                    {currentFiles.map(file => (
                      <FileItem
                        key={file.fullPath}
                        file={file}
                      />
                    ))}
                  </Stack>
                )}
              </ResizeContainer>
            </ResizeContainer.Wrapper>

            {confirmDialog}
          </Dialog>
        )}
      </Box>
    </ErrorBoundary>
  );
}
