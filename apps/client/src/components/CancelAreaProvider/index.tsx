import { SxProps, Theme } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import CancelArea from './CancelArea';
import { CancelAreaContext } from './Context';

const CancelAreaProvider = ({ children }: { children?: React.ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [areaSize, setAreaSize] = useState<DOMRect | null>(null);
  const [activated, setActivated] = useState(false);
  const [areaSx, setAreaSx] = useState<SxProps<Theme>>();
  const [defaultContainer, setDefaultContainer] = useState<HTMLElement | null>(null);
  const [customContainer, setCustomContainer] = useState<HTMLElement | null>(null);
  const container = customContainer || defaultContainer;

  useEffect(() => {
    if (!visible) {
      setDefaultContainer(null);
      setCustomContainer(null);
    }
  }, [visible]);

  const value = useMemo(
    () => ({
      areaSize,
      visible,
      setVisible,
      activated,
      setActivated,
      areaSx,
      setAreaSx,
      setCustomContainer,
    }),
    [activated, areaSize, areaSx, visible]
  );

  return (
    <CancelAreaContext.Provider value={value}>
      {children}
      {visible && (
        <div ref={setDefaultContainer}>
          {!!container &&
            createPortal(
              <CancelArea
                activated={activated}
                onSizeChange={setAreaSize}
                sx={areaSx}
              />,
              container
            )}
        </div>
      )}
    </CancelAreaContext.Provider>
  );
};

export default CancelAreaProvider;
