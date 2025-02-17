'use client';

import { useDialog } from '@/hooks/useDialog';
import { FolderOutlined } from '@mui/icons-material';
import {
  Box,
  Breadcrumbs,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  const { open, handleClose, handleOpen } = useDialog(true);
  const [dirPath, setDirPath] = useState('/aa/b/c');
  const pathList = useMemo(() => dirPath.split('/').filter(it => !!it), [dirPath]);

  const [subDirs] = useState(['aaa zxc as da zxc zxc asd as zxc zxcasd zxcxcas as da zxc zxc as', 'bbb', 'ccc']);

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

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
      >
        <DialogTitle>{t('Tools.SelectDirectory')}</DialogTitle>
        <DialogContent>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('Common.Cancel')}</Button>
          <Button onClick={handleOk}>{t('Common.OK')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
