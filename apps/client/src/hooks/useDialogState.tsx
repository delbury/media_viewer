'use client';

import { useState } from 'react';

export const useDialogState = (defaultValue = false) => {
  const [visible, setVisible] = useState(defaultValue);
  return {
    visible,
    handleOpen: () => setVisible(true),
    handleClose: () => setVisible(false),
  };
};
