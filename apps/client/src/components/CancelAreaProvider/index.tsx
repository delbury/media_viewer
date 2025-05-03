import { SxProps, Theme } from '@mui/material';
import { useMemo, useState } from 'react';
import CancelArea from './CancelArea';
import { CancelAreaContext } from './Context';

const CancelAreaProvider = ({ children }: { children?: React.ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [areaSize, setAreaSize] = useState<DOMRect | null>(null);
  const [activated, setActivated] = useState(false);
  const [areaSx, setAreaSx] = useState<SxProps<Theme>>();

  const value = useMemo(
    () => ({
      areaSize,
      visible,
      setVisible,
      activated,
      setActivated,
      areaSx,
      setAreaSx,
    }),
    [activated, areaSize, areaSx, visible]
  );

  return (
    <CancelAreaContext.Provider value={value}>
      {children}
      {visible && (
        <CancelArea
          activated={activated}
          onSizeChange={setAreaSize}
          sx={areaSx}
        />
      )}
    </CancelAreaContext.Provider>
  );
};

export default CancelAreaProvider;
