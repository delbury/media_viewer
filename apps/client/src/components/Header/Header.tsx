import Link from '#/components/Link';
import { HandymanOutlined, HomeWorkOutlined } from '@mui/icons-material';
import { StyledHeaderLinkGroup, StyledHeaderWrapper } from './style';

export const HEADER_RIGHT_SLOT_ID = 'header-right-slot';

export default function Header() {
  return (
    <StyledHeaderWrapper>
      <StyledHeaderLinkGroup>
        <Link href="/">
          <HomeWorkOutlined fontSize="inherit" />
        </Link>
        <Link href="/tools">
          <HandymanOutlined fontSize="inherit" />
        </Link>
      </StyledHeaderLinkGroup>

      <StyledHeaderLinkGroup id={HEADER_RIGHT_SLOT_ID} />
    </StyledHeaderWrapper>
  );
}
