'use client';

import Link from '#/components/Link';
import { useDialogState } from '#/hooks/useDialogState';
import { getHeaderRoutes } from '#/utils/route';
import { SettingsRounded } from '@mui/icons-material';
import { useMemo } from 'react';
import GlobalSetting from '../GlobalSetting';
import { StyledHeaderLinkGroup, StyledHeaderRight, StyledHeaderWrapper } from './style';

export const HEADER_RIGHT_SLOT_ID = 'header-right-slot';

export default function Header() {
  const settingDialog = useDialogState(false);
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

      <StyledHeaderRight>
        <StyledHeaderLinkGroup id={HEADER_RIGHT_SLOT_ID} />

        <StyledHeaderLinkGroup>
          <Link onClick={settingDialog.handleOpen}>
            <SettingsRounded />
          </Link>
        </StyledHeaderLinkGroup>
      </StyledHeaderRight>

      {settingDialog.visible && (
        <GlobalSetting
          visible={settingDialog.visible}
          onClose={settingDialog.handleClose}
        />
      )}
    </StyledHeaderWrapper>
  );
}
