'use client';

import Dialog from '@/components/Dialog';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useDialogState } from '@/hooks/useDialogState';
import { DirectoryInfo, useSwr } from '@/hooks/useSwr';
import { LoopOutlined } from '@mui/icons-material';
import { Box, Button, IconButton, List } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Empty from '../Empty';
import DirectoryItem from './DirectoryItem';
import FilesInfo from './FilesInfo';
import DirectoryPath from './DirectoryPath';
import ResizeContainer from '../ResizeContainer';

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
          {/* 当前文件夹的子文件夹 */}
          <ResizeContainer defaultHeight={'30vh'}>
            <List sx={{ padding: 0 }}>
              {currentDirs.map(dir => (
                <DirectoryItem
                  key={dir.name}
                  dir={dir}
                  onClick={() => handleSelectChild(dir)}
                />
              ))}
              {!currentDirs.length && <Empty label={t('Tools.NoDirectories')} />}
            </List>
          </ResizeContainer>

          {/* 当前文件夹的文件 */}
          <ResizeContainer defaultHeight={'20vh'}>xxx</ResizeContainer>

          {confirmDialog}
        </Dialog>
      )}
    </Box>
  );
}
