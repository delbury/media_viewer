'use client';

import Dialog from '@/components/Dialog';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useDialogState } from '@/hooks/useDialogState';
import { useSwr } from '@/hooks/useSwr';
import { FolderOutlined, LoopOutlined } from '@mui/icons-material';
import {
  Box,
  Breadcrumbs,
  Button,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import style from './index.module.scss';

export default function DirectoryPicker() {
  const t = useTranslations();
  const { visible, handleClose, handleOpen } = useDialogState(true);
  const updateRequest = useSwr('dirUpdate', { lazy: true });
  // example: /a/b/c
  const [dirPath, setDirPath] = useState('/aa/b/c');
  const pathList = useMemo(() => dirPath.split('/').filter(it => !!it), [dirPath]);
  const [subDirs] = useState([]);

  // 二次确认是否刷新
  const { dialog: confirmDialog, handleOpenSkipConfirm: confirmOpen } = useConfirmDialog(updateRequest.refresh);

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
          <Breadcrumbs>
            <Typography />
            {pathList.map((path, index) => (
              <Typography
                className={style.path_btn}
                key={`${path}_${index}`}
              >
                {path}
              </Typography>
            ))}
          </Breadcrumbs>

          {/* 当前文件夹的子文件夹 */}
          <List>
            {subDirs.map(dir => (
              <ListItemButton key={dir}>
                <ListItemIcon>
                  <FolderOutlined fontSize="large" />
                </ListItemIcon>

                <ListItemText
                  primary={dir}
                  secondary="Jan 7, 2014"
                  slotProps={{
                    primary: {
                      sx: {
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                      },
                    },
                  }}
                />
              </ListItemButton>
            ))}
          </List>

          {confirmDialog}
        </Dialog>
      )}
    </Box>
  );
}
