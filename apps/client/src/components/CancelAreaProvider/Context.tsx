import { SxProps, Theme } from '@mui/material';
import { noop } from 'lodash-es';
import { createContext } from 'react';

export interface ExtraAreasConfig {
  showExtraAreas?: boolean;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  prevText?: string;
  nextText?: string;
  onPrevActivatedCallback?: (ev: PointerEvent) => void;
  onNextActivatedCallback?: (ev: PointerEvent) => void;
}

interface CancelAreaValue {
  areaSize: DOMRect | null;
  visible: boolean;
  setVisible: (v: boolean) => void;
  activated: boolean;
  setActivated: (v: boolean) => void;
  areaSx?: SxProps<Theme>;
  setAreaSx: (sx?: SxProps<Theme>) => void;
  setCustomContainer: (elm: HTMLElement | null) => void;
  setExtraAreasConfig: (config: ExtraAreasConfig | null) => void;
  prevAreaSize: DOMRect | null;
  prevActivated: boolean;
  setPrevActivated: (v: boolean) => void;
  nextAreaSize: DOMRect | null;
  nextActivated: boolean;
  setNextActivated: (v: boolean) => void;
}

export const CancelAreaContext = createContext<CancelAreaValue>({
  areaSize: null,
  visible: false,
  setVisible: noop,
  activated: false,
  setActivated: noop,
  areaSx: null,
  setAreaSx: noop,
  setCustomContainer: noop,
  setExtraAreasConfig: noop,
  prevAreaSize: null,
  prevActivated: false,
  setPrevActivated: noop,
  nextAreaSize: null,
  nextActivated: false,
  setNextActivated: noop,
});
