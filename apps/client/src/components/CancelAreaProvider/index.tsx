import { SxProps, Theme } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import CancelArea from './CancelArea';
import { CancelAreaContext, ExtraAreasConfig } from './Context';

const PREV_EXTRA_AREA_SX: SxProps<Theme> = {
  width: '20dvw',
  transform: 'translate(-35dvw)',
};

const NEXT_EXTRA_AREA_SX: SxProps<Theme> = {
  width: '20dvw',
  transform: 'translate(35dvw)',
};

const WITH_EXTRA_MAIN_AREA_SX: SxProps<Theme> = {
  width: '40dvw',
};

const CancelAreaProvider = ({ children }: { children?: React.ReactNode }) => {
  const t = useTranslations();
  const [visible, setVisible] = useState(false);
  const [areaSize, setAreaSize] = useState<DOMRect | null>(null);
  const [activated, setActivated] = useState(false);
  const [areaSx, setAreaSx] = useState<SxProps<Theme>>();
  const [defaultContainer, setDefaultContainer] = useState<HTMLElement | null>(null);
  const [customContainer, setCustomContainer] = useState<HTMLElement | null>(null);
  const [extraAreasConfig, setExtraAreasConfig] = useState<ExtraAreasConfig | null>(null);
  const container = customContainer || defaultContainer;
  const hasExtraAreas = !!extraAreasConfig?.showExtraAreas;

  const mainSx = useMemo(
    () => ({
      ...(hasExtraAreas ? WITH_EXTRA_MAIN_AREA_SX : void 0),
      ...areaSx,
    }),
    [areaSx, hasExtraAreas]
  );

  const [prevAreaSize, setPrevAreaSize] = useState<DOMRect | null>(null);
  const [prevActivated, setPrevActivated] = useState(false);
  const prevSx = useMemo(() => ({ ...PREV_EXTRA_AREA_SX, ...areaSx }), [areaSx]);

  const [nextAreaSize, setNextAreaSize] = useState<DOMRect | null>(null);
  const [nextActivated, setNextActivated] = useState(false);
  const nextSx = useMemo(() => ({ ...NEXT_EXTRA_AREA_SX, ...areaSx }), [areaSx]);

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
      setExtraAreasConfig,
      prevAreaSize,
      prevActivated,
      setPrevActivated,
      nextAreaSize,
      nextActivated,
      setNextActivated,
    }),
    [activated, areaSize, areaSx, nextActivated, nextAreaSize, prevActivated, prevAreaSize, visible]
  );

  return (
    <CancelAreaContext.Provider value={value}>
      {children}
      {visible && (
        <div ref={setDefaultContainer}>
          {!!container && (
            <>
              {hasExtraAreas &&
                !extraAreasConfig.prevDisabled &&
                createPortal(
                  <CancelArea
                    activated={prevActivated}
                    onSizeChange={setPrevAreaSize}
                    sx={prevSx}
                    text={extraAreasConfig?.prevText ?? t('Common.Prev')}
                  />,
                  container
                )}
              {createPortal(
                <CancelArea
                  activated={activated}
                  onSizeChange={setAreaSize}
                  sx={mainSx}
                />,
                container
              )}
              {hasExtraAreas &&
                !extraAreasConfig.nextDisabled &&
                createPortal(
                  <CancelArea
                    activated={nextActivated}
                    onSizeChange={setNextAreaSize}
                    sx={nextSx}
                    text={extraAreasConfig?.nextText ?? t('Common.Next')}
                  />,
                  container
                )}
            </>
          )}
        </div>
      )}
    </CancelAreaContext.Provider>
  );
};

export default CancelAreaProvider;
