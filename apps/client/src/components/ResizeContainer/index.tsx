import { SxProps, Theme } from '@mui/material';
import { ScrollBox } from './style';

interface ResizeContainerProps {
  children?: React.ReactNode;
  defaultHeight?: string;
  sx?: SxProps<Theme>;
}

const ResizeContainer = ({ children, defaultHeight, sx }: ResizeContainerProps) => {
  return (
    <ScrollBox
      height={defaultHeight}
      sx={sx}
    >
      {children}
    </ScrollBox>
  );
};

export default ResizeContainer;
