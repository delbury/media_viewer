'use client';

import { useUpdateOperation } from '#/components/DirectoryPicker/hooks/useUpdateOperation';
import { HeaderSlot } from '#/components/Header';
import { StyledHeaderLinkGroup } from '#/components/Header/style';
import { SxProps, Theme } from '@mui/material';

const HEADER_SLOT_BTN_SX: SxProps<Theme> = {
  padding: 0,
};

export default function Home() {
  // 更新 api
  const { DirUpdateBtn, PosterClearBtn } = useUpdateOperation({
    btnSx: HEADER_SLOT_BTN_SX,
  });

  return (
    <div>
      <div>Hello World</div>

      <HeaderSlot>
        <StyledHeaderLinkGroup>
          {DirUpdateBtn}
          {PosterClearBtn}
        </StyledHeaderLinkGroup>
      </HeaderSlot>
    </div>
  );
}
