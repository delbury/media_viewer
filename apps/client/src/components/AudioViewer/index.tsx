import { FileInfo } from '#pkgs/apis';
import FixedModal, { FixedModalProps } from '../FixedModal';

type AudioViewerProps = {
  file: FileInfo;
} & Omit<FixedModalProps, 'children'>;

const AudioViewer = ({ visible, onClose }: AudioViewerProps) => {
  return (
    <FixedModal
      visible={visible}
      onClose={onClose}
    >
      xxxx
    </FixedModal>
  );
};

export default AudioViewer;
