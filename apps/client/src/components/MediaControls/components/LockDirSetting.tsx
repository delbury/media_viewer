import Dialog from '#/components/Dialog';
import { renderPathInfo } from '#/components/DirectoryPicker/components/FileDetailDialog';
import { useDialogState } from '#/hooks/useDialogState';
import { FileInfo } from '#pkgs/apis';
import { LockRounded, NoEncryptionRounded } from '@mui/icons-material';
import { Badge, IconButton } from '@mui/material';
import { RefObject, useCallback, useEffect, useMemo } from 'react';
import { StyledLockDirContainer } from '../style';
import { findFullscreenRoot } from '../util';

interface LockDirSettingProps {
  value?: string[];
  onChange: (val?: string[]) => void;
  disabled?: boolean;
  file: FileInfo;
  mediaRef: RefObject<HTMLMediaElement | null>;
}

const LockDirSetting = ({ value, onChange, disabled, file, mediaRef }: LockDirSettingProps) => {
  const { visible, handleClose, handleOpen } = useDialogState();

  const onPathClick = useCallback(
    (paths: string[]) => {
      onChange(paths);
      handleClose();
    },
    [handleClose, onChange]
  );

  const DirPath = useMemo(
    () =>
      renderPathInfo(file.showPath, onPathClick, { selectedDirs: value, noHighlightColor: true }),
    [file.showPath, onPathClick, value]
  );

  const handleClick = useCallback(() => {
    if (!value) {
      handleOpen();
    } else {
      onChange(void 0);
    }
  }, [handleOpen, onChange, value]);

  const findContainer = useCallback(() => findFullscreenRoot(mediaRef.current), [mediaRef]);

  useEffect(() => {
    if (disabled) {
      onChange(void 0);
    }
  }, [disabled, onChange]);

  return (
    <>
      <IconButton
        disabled={disabled}
        onClick={handleClick}
      >
        {value ? (
          <Badge
            badgeContent={value?.length}
            max={99}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
          >
            <LockRounded color="primary" />
          </Badge>
        ) : (
          <NoEncryptionRounded />
        )}
      </IconButton>

      <Dialog
        open={visible}
        onClose={handleClose}
        title={file.name}
        onlyClose
        dialogProps={{
          maxWidth: 'xs',
        }}
        container={findContainer}
      >
        <StyledLockDirContainer>{DirPath}</StyledLockDirContainer>
      </Dialog>
    </>
  );
};

export default LockDirSetting;
