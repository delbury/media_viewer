import Link from '@/components/Link';
import { HandymanOutlined, HomeWorkOutlined } from '@mui/icons-material';
import { StyledHeaderWrapper } from './style';

export default function Header() {
  return (
    <StyledHeaderWrapper>
      <Link href="/">
        <HomeWorkOutlined fontSize="inherit" />
      </Link>
      <Link href="/tools">
        <HandymanOutlined fontSize="inherit" />
      </Link>
    </StyledHeaderWrapper>
  );
}
