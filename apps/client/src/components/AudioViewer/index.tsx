import { getFileUrls } from '#/utils';
import { FileInfo } from '#pkgs/apis';
import { useMemo } from 'react';
import FixedModal, { FixedModalProps } from '../FixedModal';
import { StyledContentWrapper, StyledFileName, StyledImgContainer } from './style';

type AudioViewerProps = {
  file: FileInfo;
} & Omit<FixedModalProps, 'children'>;

const AudioViewer = ({ visible, onClose, file }: AudioViewerProps) => {
  const urls = useMemo(() => getFileUrls(file), [file]);

  return (
    <FixedModal
      visible={visible}
      onClose={onClose}
    >
      <StyledContentWrapper>
        <StyledImgContainer>
          {!!urls.poster && (
            <img
              src={urls.poster}
              alt={file.name}
            />
          )}
        </StyledImgContainer>

        <StyledFileName>{file.name}</StyledFileName>

        {!!urls.source && (
          <audio
            src={urls.source}
            controls
          />
        )}
      </StyledContentWrapper>
    </FixedModal>
  );
};

export default AudioViewer;
