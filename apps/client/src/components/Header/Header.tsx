import Link from '#/components/Link';
import { getHeaderRoutes } from '#/utils/route';
import { useMemo } from 'react';
import { StyledHeaderLinkGroup, StyledHeaderWrapper } from './style';

export const HEADER_RIGHT_SLOT_ID = 'header-right-slot';

export default function Header() {
  const routes = useMemo(() => getHeaderRoutes(), []);

  return (
    <StyledHeaderWrapper>
      <StyledHeaderLinkGroup>
        {routes.map(r => (
          <Link
            key={r.path}
            href={r.path}
          >
            {r.icon}
          </Link>
        ))}
      </StyledHeaderLinkGroup>

      <StyledHeaderLinkGroup id={HEADER_RIGHT_SLOT_ID} />
    </StyledHeaderWrapper>
  );
}
