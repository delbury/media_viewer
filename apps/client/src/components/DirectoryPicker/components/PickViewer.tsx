import Dialog from '#/components/Dialog';
import { useConfirmDialogByKeys } from '#/hooks/useConfirmDialog';
import { useSwr } from '#/hooks/useSwr';
import { DirectoryInfo } from '#pkgs/apis';
import { CleaningServicesOutlined, LoopOutlined } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useRef, useState } from 'react';
import CurrentFilesInfo from './CurrentFilesInfo';
import FileBrowser, { FileBrowserInstance } from './FileBrowser';

interface PickViewerProps {
  visible: boolean;
  onClose: () => void;
  onOk?: (dirInfo: DirectoryInfo[]) => void;
}

const PickViewer = ({ visible, onClose, onOk }: PickViewerProps) => {
  const t = useTranslations();
  const fileBrowserRef = useRef<FileBrowserInstance>(null);

  // 后端强制更新文件信息
  const updateRequest = useSwr('dirUpdate', {
    lazy: true,
    noticeWhenSuccess: true,
    onSuccess: res => {
      fileBrowserRef.current?.updatePathList(res.data?.treeNode ? [res.data.treeNode] : []);
    },
  });

  // 删除缩略图
  const clearPosterRequest = useSwr('posterClear', {
    lazy: true,
    noticeWhenSuccess: true,
    data: {
      // clearAll: true,
    },
  });

  // 二次确认是否刷新
  const { ConfirmDialog, handleOpen: confirmOpen } = useConfirmDialogByKeys({
    dirUpdate: {
      onOk: updateRequest.refresh,
      description: t('Tools.AreYouSureReGenerateDirectoryInfo'),
    },
    posterClear: {
      onOk: clearPosterRequest.refresh,
      description: t('Tools.AreYouSureClearUselessPoster'),
    },
  });

  const [currentPathNode, setCurrentPathNode] = useState<DirectoryInfo>();
  const [pathList, setPathList] = useState<DirectoryInfo[]>([]);

  const currentTotalFileCount = currentPathNode?.totalFilesCount ?? 0;
  const currentSelfFileCount = currentPathNode?.selfFilesCount ?? 0;
  const currentSelfDirectoryCount = currentPathNode?.children?.length ?? 0;

  const handleOk = useCallback(() => {
    onClose();
    onOk?.(pathList);
  }, [onClose, onOk, pathList]);

  return (
    visible && (
      <Dialog
        open={visible}
        onClose={onClose}
        onOk={handleOk}
        title={t('Tools.SelectDirectory')}
        dialogProps={{
          maxWidth: 'md',
        }}
        titleRightSlot={
          <CurrentFilesInfo
            totalFiles={currentTotalFileCount}
            selfFiles={currentSelfFileCount}
            selfDirectories={currentSelfDirectoryCount}
          />
        }
        leftFooterSlot={
          <>
            <IconButton
              loading={updateRequest.isLoading}
              onClick={() => confirmOpen('dirUpdate')}
            >
              <LoopOutlined />
            </IconButton>
            <IconButton
              loading={updateRequest.isLoading}
              onClick={() => confirmOpen('posterClear')}
            >
              <CleaningServicesOutlined />
            </IconButton>
          </>
        }
      >
        <FileBrowser
          ref={fileBrowserRef}
          containerHeight="60vh"
          onPathNodeChange={setCurrentPathNode}
          onPathListChange={setPathList}
        />
        {ConfirmDialog}
      </Dialog>
    )
  );
};

export default PickViewer;
