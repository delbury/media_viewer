import { API_BASE_URL } from '#/request';
import { FileInfo, joinUrlWithQueryString } from '#pkgs/apis';
import { useMemo } from 'react';
import FixedModal, { FixedModalProps } from '../FixedModal';
import { StyledAudioWrapper } from './style';

type AudioViewerProps = {
  file: FileInfo;
} & Omit<FixedModalProps, 'children'>;

const AudioViewer = ({ visible, onClose, file }: AudioViewerProps) => {
  const url = useMemo(() => {
    return joinUrlWithQueryString(
      'fileGet',
      {
        basePathIndex: file.basePathIndex.toString(),
        relativePath: file.relativePath,
      },
      API_BASE_URL
    );
  }, [file]);

  return (
    <FixedModal
      visible={visible}
      onClose={onClose}
    >
      <StyledAudioWrapper>
        {!!url && (
          <audio
            src={url}
            controls
          />
        )}
      </StyledAudioWrapper>
    </FixedModal>
  );
};

export default AudioViewer;
