import { CircularProgress } from '@mui/material';

interface LoadingProps {
  color?: string;
}

const Loading = ({ color }: LoadingProps) => {
  return (
    <CircularProgress
      sx={{ width: '100%', height: '100%', color: color ?? 'inherit' }}
      thickness={6}
    />
  );
};

export default Loading;
