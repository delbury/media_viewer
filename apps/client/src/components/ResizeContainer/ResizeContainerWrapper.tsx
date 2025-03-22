import { SxProps, Theme } from '@mui/material';
import { StyledContainerWrapper } from './style';

interface ResizeContainerWrapperProps {
  children?: React.ReactNode;
  height?: string;
  sx?: SxProps<Theme>;
}

const ResizeContainerWrapper = ({ height, children, sx }: ResizeContainerWrapperProps) => {
  return (
    <StyledContainerWrapper
      height={height}
      sx={sx}
    >
      {children}
    </StyledContainerWrapper>
  );
};

export default ResizeContainerWrapper;
