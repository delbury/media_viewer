'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { HEADER_RIGHT_SLOT_ID } from './Header';

interface HeaderSlotProps {
  disabled?: boolean;
  children?: React.ReactNode;
}

const HeaderSlot = ({ disabled, children }: HeaderSlotProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    !disabled &&
    visible &&
    createPortal(children, document.getElementById(HEADER_RIGHT_SLOT_ID) as Element)
  );
};

export default HeaderSlot;
