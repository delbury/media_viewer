'use client';

import { isNil } from 'lodash-es';
import { useCallback, useState } from 'react';

export const useDialogState = (defaultValue = false) => {
  const [visible, setVisible] = useState(defaultValue);

  const handleOpen = useCallback(() => setVisible(true), []);
  const handleClose = useCallback(() => setVisible(false), []);

  return {
    visible,
    handleOpen,
    handleClose,
  };
};

export const useDialogStateByValue = function <T>(defaultValue = null) {
  const [stateValue, setStateValue] = useState<T | null>(defaultValue);

  const handleOpen = useCallback((val: T) => setStateValue(val), []);
  const handleClose = useCallback(() => setStateValue(null), []);

  return {
    stateValue,
    visible: !isNil(stateValue),
    handleOpen,
    handleClose,
  };
};
