import { useMediaViewerContext } from '#/hooks/useMediaViewerContext';
import { FileInfo } from '#pkgs/apis';
import { FormatListBulletedRounded, PinDropRounded } from '@mui/icons-material';
import { Badge, IconButton } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useRef, useState } from 'react';
import Dialog from '../Dialog';
import { ScrollBoxInstance } from './../ScrollBox/index';
import FileListContent from './FileListContent';
import {
  FILE_ITEM_ROW_HEIGHT,
  StyledListPreviewerWrapper,
  StyledSlotWrapper,
  StyleFilesContainer,
} from './style';

interface FileListPreviewerProps {
  currentFileIndex?: number;
  files?: FileInfo[];
}

const FileListPreviewer = ({ files, currentFileIndex }: FileListPreviewerProps) => {
  const t = useTranslations();
  const [visible, setVisible] = useState(false);
  const fileCount = useMemo(() => files?.length ?? 0, [files]);

  const handleOpen = useCallback(() => setVisible(true), []);
  const handleClose = useCallback(() => setVisible(false), []);

  const scrollBoxRef = useRef<ScrollBoxInstance>(null);
  const defaultScroll = FILE_ITEM_ROW_HEIGHT * ((currentFileIndex ?? 0) - 0.5);

  const scrollToCurrentFile = useCallback(() => {
    scrollBoxRef.current?.scrollTo({
      top: defaultScroll,
    });
  }, [defaultScroll]);

  const { jumpToFile } = useMediaViewerContext();
  const handleJumpToFileIndex = useCallback(
    (_: FileInfo, index: number) => {
      jumpToFile(index);
      setVisible(false);
    },
    [jumpToFile]
  );

  return (
    <StyledListPreviewerWrapper>
      <IconButton onClick={handleOpen}>
        <Badge
          badgeContent={fileCount}
          max={999}
        >
          <FormatListBulletedRounded />
        </Badge>
      </IconButton>

      {visible && (
        <Dialog
          title={t('Tools.FileListPreviewer')}
          open={visible}
          onClose={handleClose}
          onlyClose
          titleRightSlot={
            <StyledSlotWrapper>
              <IconButton onClick={scrollToCurrentFile}>
                <PinDropRounded fontSize="small" />
              </IconButton>
              <span>
                {currentFileIndex} / {files?.length ?? 0}
              </span>
            </StyledSlotWrapper>
          }
        >
          <StyleFilesContainer>
            <FileListContent
              scrollBoxRef={scrollBoxRef}
              files={files}
              currentFileIndex={currentFileIndex}
              onItemClick={handleJumpToFileIndex}
            />
          </StyleFilesContainer>
        </Dialog>
      )}
    </StyledListPreviewerWrapper>
  );
};

export default FileListPreviewer;
