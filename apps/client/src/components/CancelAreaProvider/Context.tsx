import { noop } from 'lodash-es';
import { createContext } from 'react';

interface CancelAreaValue {
  areaSize: DOMRect | null;
  visible: boolean;
  setVisible: (v: boolean) => void;
  activated: boolean;
  setActivated: (v: boolean) => void;
}

export const CancelAreaContext = createContext<CancelAreaValue>({
  areaSize: null,
  visible: false,
  setVisible: noop,
  activated: false,
  setActivated: noop,
});
