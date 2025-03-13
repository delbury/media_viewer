'use client';

import Dialog from '@/components/Dialog';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useDialogState } from '@/hooks/useDialogState';
import { DirectoryInfo, useSwr } from '@/hooks/useSwr';
import { LoopOutlined, OtherHouses, OtherHousesOutlined } from '@mui/icons-material';
import { Box, Breadcrumbs, Button, Chip, Divider, IconButton, List, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Empty from '../Empty';
import DirectoryItem from './DirectoryItem';
import FilesInfo from './FilesInfo';
import style from './index.module.scss';
import { useStyles } from './style';

const SEPARATOR = '/';

export default function DirectoryPicker() {
  const t = useTranslations();
  const { visible, handleClose, handleOpen } = useDialogState(true);
  const classes = useStyles();

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
  const isAtHome = pathList.length === 1;

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
          title={
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography>{t('Tools.SelectDirectory')}</Typography>
              <FilesInfo
                total={currentTotalFileCount}
                self={currentSelfFileCount}
              />
            </Box>
          }
          leftFooter={
            <IconButton
              loading={updateRequest.isLoading}
              onClick={confirmOpen}
            >
              <LoopOutlined />
            </IconButton>
          }
        >
          <Box height={'50vh'}>
            {/* 已选文件夹 */}
            <Breadcrumbs
              separator={SEPARATOR}
              classes={{ ol: classes.ol }}
            >
              {pathList.map((path, index) => {
                const isFirst = index === 0;
                const isLast = index === pathList.length - 1;
                const key = `${path}_${index}`;
                return isFirst ? (
                  <Box
                    sx={{ fontSize: 0 }}
                    key={key}
                  >
                    <IconButton
                      size="small"
                      color={isAtHome ? 'primary' : void 0}
                      onClick={() => setTarget(index)}
                    >
                      {isAtHome ? <OtherHouses /> : <OtherHousesOutlined />}
                    </IconButton>
                  </Box>
                ) : (
                  <Box
                    className={style.path_btn}
                    key={key}
                  >
                    <Chip
                      label={path.name}
                      size="small"
                      variant={isLast ? 'filled' : 'outlined'}
                      color={isLast ? 'primary' : 'default'}
                      onClick={() => setTarget(index)}
                      style={{ maxWidth: 'min(300px, 35vw)' }}
                    />
                  </Box>
                );
              })}
            </Breadcrumbs>

            <Divider style={{ marginTop: 8 }} />

            {/* 当前文件夹的子文件夹 */}
            <List>
              {currentDirs.map(dir => (
                <DirectoryItem
                  key={dir.name}
                  dir={dir}
                  onClick={() => handleSelectChild(dir)}
                />
              ))}
              {!currentDirs.length && <Empty label={t('Tools.NoDirectories')} />}
            </List>
          </Box>

          {confirmDialog}
        </Dialog>
      )}
    </Box>
  );
}
