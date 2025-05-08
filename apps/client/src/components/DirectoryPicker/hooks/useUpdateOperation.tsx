import { useConfirmDialogByKeys } from '#/hooks/useConfirmDialog';
import { useSwrMutation } from '#/hooks/useSwr';
import { CleaningServicesOutlined, LoopOutlined } from '@mui/icons-material';
import { IconButton, SxProps, Theme } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { FileBrowserInstance } from '../components/FileBrowser';

interface UseUpdateOperationParams {
  fileBrowserRef: React.RefObject<FileBrowserInstance | null>;
  btnSx?: SxProps<Theme>;
}

export const useUpdateOperation = ({ fileBrowserRef, btnSx }: UseUpdateOperationParams) => {
  const t = useTranslations();

  // 后端强制更新文件信息
  const updateRequest = useSwrMutation('dirUpdate', {
    noticeWhenSuccess: true,
    onSuccess: res => {
      fileBrowserRef.current?.updatePathList(res.data?.treeNode ? [res.data.treeNode] : []);
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
  const { ConfirmDialog, handleOpen: confirmOpen } = useConfirmDialogByKeys({
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
        loading={updateRequest.isLoading}
        onClick={() => confirmOpen('dirUpdate')}
        sx={btnSx}
      >
        <LoopOutlined />
      </IconButton>
    );
  }, [btnSx, confirmOpen, updateRequest.isLoading]);

  const PosterClearBtn = useMemo(() => {
    return (
      <IconButton
        loading={updateRequest.isLoading}
        onClick={() => confirmOpen('posterClear')}
        sx={btnSx}
      >
        <CleaningServicesOutlined />
      </IconButton>
    );
  }, [btnSx, confirmOpen, updateRequest.isLoading]);

  return {
    DirUpdateBtn,
    PosterClearBtn,
    ConfirmDialog,
  };
};
