import Dialog from '#/components/Dialog';
import { useConfirmDialogByKeys } from '#/hooks/useConfirmDialog';
import { DirectoryInfo, useSwr } from '#/hooks/useSwr';
import { CleaningServicesOutlined, LoopOutlined } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import ResizeContainer from '../../ResizeContainer';
import CurrentFilesInfo from './CurrentFilesInfo';
import DirectoryItemList from './DirectoryItemList';
import FileItemList from './FileItemList';
import SelectingPathInfo from './SelectingPathInfo';

interface PickViewerProps {
  visible: boolean;
  onClose: () => void;
  onOk?: (dirInfo: DirectoryInfo[]) => void;
}

const PickViewer = ({ visible, onClose, onOk }: PickViewerProps) => {
  const t = useTranslations();

  // 后端强制更新文件信息
  const updateRequest = useSwr('dirUpdate', {
    lazy: true,
    onSuccess: res => {
      setPathList(res.data?.treeNode ? [res.data.treeNode] : []);
    },
  });

  // 删除缩略图
  const clearPosterRequest = useSwr('filePosterClear', {
    lazy: true,
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
    filePosterClear: {
      onOk: clearPosterRequest.refresh,
      description: t('Tools.AreYouSureClearUselessPoster'),
    },
  });

  // 请求文件夹树
  const dirRequest = useSwr('dirTree', {
    onSuccess: res => {
      setPathList(res.data ? [res.data] : []);
    },
  });
  const [pathList, setPathList] = useState<DirectoryInfo[]>(
    dirRequest.data ? [dirRequest.data] : []
  );
  // 当前目录下的子文件夹
  const currentPathNode = useMemo(() => pathList[pathList.length - 1], [pathList]);
  const currentDirs = useMemo(() => currentPathNode?.children ?? [], [currentPathNode]);
  const currentFiles = useMemo(() => currentPathNode?.files ?? [], [currentPathNode]);

  const currentTotalFileCount = currentPathNode?.totalFilesCount ?? 0;
  const currentSelfFileCount = currentPathNode?.selfFilesCount ?? 0;
  const currentSelfDirectoryCount = currentDirs.length;

  // 设置当前已选文件夹
  const setTarget = (index: number) => {
    setPathList(pathList.slice(0, index + 1));
  };
  // 初始化数据

  const handleSelectChild = (dir: DirectoryInfo) => {
    setPathList([...pathList, dir]);
  };

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
              onClick={() => confirmOpen('filePosterClear')}
            >
              <CleaningServicesOutlined />
            </IconButton>
          </>
        }
      >
        {/* 已选文件夹 */}
        <SelectingPathInfo
          pathList={pathList}
          onItemClick={setTarget}
        />
        <ResizeContainer.Wrapper height="60vh">
          {/* 当前文件夹的子文件夹 */}
          <DirectoryItemList
            dirs={currentDirs}
            onClick={handleSelectChild}
          />
          {/* 当前文件夹的文件 */}
          <FileItemList files={currentFiles} />
        </ResizeContainer.Wrapper>

        {ConfirmDialog}
      </Dialog>
    )
  );
};

export default PickViewer;
