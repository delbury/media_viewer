'use client';

import { useState } from 'react';

export const useDialog = (defaultValue = false) => {
  const [open, setOpen] = useState(defaultValue);
  return {
    open,
    handleOpen: () => setOpen(true),
    handleClose: () => setOpen(false),
  };
};
