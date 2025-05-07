import Dialog from '#/components/Dialog';
import { DirectoryInfo } from '#pkgs/apis';
import { useTranslations } from 'next-intl';
import { useCallback, useRef, useState } from 'react';
import { useUpdateOperation } from '../hooks/useUpdateOperation';
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

  // 更新 api
  const { DirUpdateBtn, PosterClearBtn, ConfirmDialog } = useUpdateOperation({
    fileBrowserRef,
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
            {DirUpdateBtn}
            {PosterClearBtn}
          </>
        }
      >
        <FileBrowser
          ref={fileBrowserRef}
          height="65vh"
          onPathNodeChange={setCurrentPathNode}
          onPathListChange={setPathList}
        />
        {ConfirmDialog}
      </Dialog>
    )
  );
};

export default PickViewer;
