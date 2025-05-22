import { SxProps, Theme } from '@mui/material';
import { noop } from 'lodash-es';
import { createContext } from 'react';

interface CancelAreaValue {
  areaSize: DOMRect | null;
  visible: boolean;
  setVisible: (v: boolean) => void;
  activated: boolean;
  setActivated: (v: boolean) => void;
  areaSx?: SxProps<Theme>;
  setAreaSx: (sx?: SxProps<Theme>) => void;
  setCustomContainer: (elm: HTMLElement | null) => void;
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
});
