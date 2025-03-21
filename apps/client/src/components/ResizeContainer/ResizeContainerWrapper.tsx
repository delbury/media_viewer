import { SxProps, Theme } from '@mui/material';
import { ContainerWrapper } from './style';

interface ResizeContainerWrapperProps {
  children?: React.ReactNode;
  height?: string;
  sx?: SxProps<Theme>;
}

const ResizeContainerWrapper = ({ height, children, sx }: ResizeContainerWrapperProps) => {
  return (
    <ContainerWrapper
      height={height}
      sx={sx}
    >
      {children}
    </ContainerWrapper>
  );
};

export default ResizeContainerWrapper;
