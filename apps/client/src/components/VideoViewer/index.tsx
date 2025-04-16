import { getFilePosterUrl, getFileSourceUrl } from '#/utils';
import { FileInfo } from '#pkgs/apis';
import { useMemo } from 'react';
import FixedModal, { FixedModalProps } from '../FixedModal';
import { StyledContentWrapper, StyledVideoWrapper } from './style';

type VideoViewerProps = {
  file: FileInfo;
} & Omit<FixedModalProps, 'children'>;

const VideoViewer = ({ visible, onClose, file }: VideoViewerProps) => {
  // 链接
  const posterUrl = useMemo(() => getFilePosterUrl(file), [file]);
  const sourceUrl = useMemo(() => getFileSourceUrl(file), [file]);

  return (
    <FixedModal
      visible={visible}
      onClose={onClose}
      title={file.name}
    >
      <StyledContentWrapper>
        <StyledVideoWrapper>
          {sourceUrl && (
            <video
              poster={posterUrl}
              src={sourceUrl}
              controls
            />
          )}
        </StyledVideoWrapper>
      </StyledContentWrapper>
    </FixedModal>
  );
};

export default VideoViewer;
