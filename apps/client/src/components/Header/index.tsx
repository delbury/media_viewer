import Link from '@/components/Link';
import { HandymanOutlined, HomeWorkOutlined } from '@mui/icons-material';
import { Box } from '@mui/material';
import style from './index.module.scss';

export default function Header() {
  return (
    <Box className={style.header}>
      <Link href="/">
        <HomeWorkOutlined fontSize="inherit" />
      </Link>
      <Link href="/tools">
        <HandymanOutlined fontSize="inherit" />
      </Link>
    </Box>
  );
}
