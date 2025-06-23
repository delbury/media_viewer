import Dialog from '#/components/Dialog';
import { renderPathInfo } from '#/components/DirectoryPicker/components/FileDetailDialog';
import { useMediaViewerContext } from '#/hooks/useMediaViewerContext';
import { DirectoryInfo } from '#pkgs/apis';
import { MediaFileType } from '#pkgs/shared';
import { findDirInfoInRootDir } from '#pkgs/tools/common';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';

interface PlayDirDialogProps {
  visible: boolean;
  onClose: () => void;
  rootDir?: DirectoryInfo;
  dir?: DirectoryInfo;
  mediaType: MediaFileType;
}

const PlayDirDialog = ({ rootDir, dir, visible, onClose, mediaType }: PlayDirDialogProps) => {
  const t = useTranslations();

  const { openMediaViewer } = useMediaViewerContext();

  const handleDirClick = useCallback(
    (paths: string[]) => {
      if (!rootDir) return;

      const target = findDirInfoInRootDir(rootDir, paths);
      if (target)
        openMediaViewer({
          mediaType,
          dir: target,
          noFileDetailPathDirClickEvent: true,
        });
    },
    [mediaType, openMediaViewer, rootDir]
  );

  return (
    <Dialog
      open={visible}
      onClose={onClose}
      title={t('Tools.SelectDirectory')}
      onlyClose
    >
      {renderPathInfo(dir?.showPath, handleDirClick, { lastClickable: true })}
    </Dialog>
  );
};

export default PlayDirDialog;
