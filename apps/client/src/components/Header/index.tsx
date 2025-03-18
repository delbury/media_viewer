import Link from '@/components/Link';
import { HandymanOutlined, HomeWorkOutlined } from '@mui/icons-material';
import { HeaderWrapper } from './style';

export default function Header() {
  return (
    <HeaderWrapper>
      <Link href="/">
        <HomeWorkOutlined fontSize="inherit" />
      </Link>
      <Link href="/tools">
        <HandymanOutlined fontSize="inherit" />
      </Link>
    </HeaderWrapper>
  );
}
