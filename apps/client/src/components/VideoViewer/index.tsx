import { FileInfo } from '#pkgs/apis';
import FixedModal, { FixedModalProps } from '../FixedModal';

type VideoViewerProps = {
  file: FileInfo;
} & Omit<FixedModalProps, 'children'>;

const VideoViewer = ({ visible, onClose, file }: VideoViewerProps) => {
  return (
    <FixedModal
      visible={visible}
      onClose={onClose}
    >
      xxx
    </FixedModal>
  );
};

export default VideoViewer;
