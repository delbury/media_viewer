'use client';

import Dialog from '@/components/Dialog';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useDialogState } from '@/hooks/useDialogState';
import { DirTreeData, useSwr } from '@/hooks/useSwr';
import { formatDate } from '@/utils';
import { FolderOutlined, LoopOutlined, OtherHousesOutlined } from '@mui/icons-material';
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Empty from '../Empty';
import style from './index.module.scss';

const SEPARATOR = '/';

export default function DirectoryPicker() {
  const t = useTranslations();
  const { visible, handleClose, handleOpen } = useDialogState(true);

  // 后端强制更新文件信息
  const updateRequest = useSwr('dirUpdate', { lazy: true });
  // 二次确认是否刷新
  const { dialog: confirmDialog, handleOpenSkipConfirm: confirmOpen } = useConfirmDialog(updateRequest.refresh);

  // 请求文件夹树
  const dirRequest = useSwr('dirTree');
  // example: /a/b/c
  const [pathList, setPathList] = useState<string[]>([]);
  // 当前目录下的子文件夹
  const [currentDirs, setCurrentDirs] = useState<DirTreeData[]>([]);

  useEffect(() => {
    setCurrentDirs(dirRequest.data?.children ?? []);
  }, [dirRequest.data]);

  const handleSelectChild = (dir: DirTreeData) => {
    setPathList([...pathList, dir.name]);
    setCurrentDirs(dir.children ?? []);
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
          leftFooter={
            <IconButton
              loading={updateRequest.isLoading}
              onClick={confirmOpen}
            >
              <LoopOutlined />
            </IconButton>
          }
        >
          {/* 已选文件夹 */}
          <Breadcrumbs separator={SEPARATOR}>
            <Box sx={{ fontSize: 0 }}>
              <OtherHousesOutlined fontSize="small" />
            </Box>
            {pathList.map((path, index) => {
              const isLast = index === pathList.length - 1;
              return (
                <Box
                  className={style.path_btn}
                  key={`${path}_${index}`}
                >
                  <Chip
                    label={path}
                    size="small"
                    variant={isLast ? 'filled' : 'outlined'}
                    color={isLast ? 'primary' : 'default'}
                  />
                </Box>
              );
            })}
          </Breadcrumbs>

          {/* 当前文件夹的子文件夹 */}
          <List>
            {currentDirs.map(dir => (
              <ListItemButton
                key={dir.name}
                onClick={() => handleSelectChild(dir)}
              >
                <ListItemIcon>
                  <FolderOutlined fontSize="large" />
                </ListItemIcon>

                <ListItemText
                  primary={dir.name}
                  secondary={
                    <>
                      <span>{formatDate(dir.updated)}</span>
                      <span>{dir.files?.length} files</span>
                    </>
                  }
                  slotProps={{
                    primary: {
                      sx: {
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                      },
                    },
                    secondary: {
                      sx: {
                        display: 'flex',
                        justifyContent: 'space-between',
                      },
                    },
                  }}
                />
              </ListItemButton>
            ))}
            {!currentDirs.length && <Empty label={t('Tools.NoDirectories')} />}
          </List>

          {confirmDialog}
        </Dialog>
      )}
    </Box>
  );
}
