import { useConfirmDialogByKeys } from '#/hooks/useConfirmDialog';
import { useSwrMutation } from '#/hooks/useSwr';
import { CleaningServicesOutlined, LoopOutlined } from '@mui/icons-material';
import { IconButton, SxProps, Theme } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { mutate } from 'swr';
import { FILE_BROWSER_DIR_TREE_REQUEST_KEY } from '../components/FileBrowser';

interface UseUpdateOperationParams {
  btnSx?: SxProps<Theme>;
}

export const useUpdateOperation = ({ btnSx }: UseUpdateOperationParams = {}) => {
  const t = useTranslations();

  // 后端强制更新文件信息
  const updateRequest = useSwrMutation('dirUpdate', {
    noticeWhenSuccess: true,
    onSuccess: res => {
      const newData = {
        code: res.code,
        data: res.data?.treeNode,
      };
      mutate(FILE_BROWSER_DIR_TREE_REQUEST_KEY, newData, {
        revalidate: false,
      });
    },
  });

  // 删除缩略图
  const clearPosterRequest = useSwrMutation('posterClear', {
    noticeWhenSuccess: true,
    data: {
      // clearAll: true,
    },
  });

  // 二次确认是否刷新
  const { ConfirmDialog, openConfirmDialog, currentKey } = useConfirmDialogByKeys({
    dirUpdate: {
      onOk: updateRequest.trigger,
      description: t('Tools.AreYouSureReGenerateDirectoryInfo'),
    },
    posterClear: {
      onOk: clearPosterRequest.trigger,
      description: t('Tools.AreYouSureClearUselessPoster'),
    },
  });

  const DirUpdateBtn = useMemo(() => {
    return (
      <IconButton
        loading={updateRequest.isLoading && currentKey === 'dirUpdate'}
        onClick={() => openConfirmDialog('dirUpdate')}
        sx={btnSx}
      >
        <LoopOutlined />
      </IconButton>
    );
  }, [btnSx, currentKey, openConfirmDialog, updateRequest.isLoading]);

  const PosterClearBtn = useMemo(() => {
    return (
      <IconButton
        loading={updateRequest.isLoading && currentKey === 'posterClear'}
        onClick={() => openConfirmDialog('posterClear')}
        sx={btnSx}
      >
        <CleaningServicesOutlined />
      </IconButton>
    );
  }, [btnSx, currentKey, openConfirmDialog, updateRequest.isLoading]);

  return {
    DirUpdateBtn,
    PosterClearBtn,
    ConfirmDialog,
  };
};
