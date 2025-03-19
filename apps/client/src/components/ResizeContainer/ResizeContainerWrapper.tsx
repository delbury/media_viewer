import { ContainerWrapper } from './style';

interface ResizeContainerWrapperProps {
  children?: React.ReactNode;
  height?: string;
}

const ResizeContainerWrapper = ({ height, children }: ResizeContainerWrapperProps) => {
  return <ContainerWrapper height={height}>{children}</ContainerWrapper>;
};

export default ResizeContainerWrapper;
