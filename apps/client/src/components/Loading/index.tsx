import { CircularProgress, CircularProgressProps } from '@mui/material';
import { useEffect, useState } from 'react';

interface LoadingProps {
  color?: string;
  size?: CircularProgressProps['size'];
  // 延迟出现
  lazy?: boolean | number;
}

const Loading = ({ color, size, lazy }: LoadingProps) => {
  const [visible, setVisible] = useState(lazy !== true);

  useEffect(() => {
    if (lazy) {
      window.setTimeout(
        () => {
          setVisible(true);
        },
        typeof lazy === 'number' ? lazy : 250
      );
    }
  }, []);

  return (
    visible && (
      <CircularProgress
        sx={{ color: color ?? 'inherit' }}
        thickness={4}
        size={size}
      />
    )
  );
};

export default Loading;
