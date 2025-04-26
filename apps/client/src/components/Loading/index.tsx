import { CircularProgress, CircularProgressProps } from '@mui/material';

interface LoadingProps {
  color?: string;
  size?: CircularProgressProps['size'];
}

const Loading = ({ color, size }: LoadingProps) => {
  return (
    <CircularProgress
      sx={{ color: color ?? 'inherit' }}
      thickness={4}
      size={size}
    />
  );
};

export default Loading;
