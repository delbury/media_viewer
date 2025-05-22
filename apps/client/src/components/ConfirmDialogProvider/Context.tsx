'use client';

import { noop } from 'lodash-es';
import { createContext } from 'react';

interface OpenArgs {
  title?: string;
  description?: string;
  onOk?: () => unknown | Promise<unknown>;
}

type OpenConfirmDialogType = (args?: OpenArgs) => void;

export interface ConfirmDialogContextValue {
  openConfirmDialog: OpenConfirmDialogType;
  closeConfirmDialog: () => void;
}

export const ConfirmDialogContext = createContext<ConfirmDialogContextValue>({
  openConfirmDialog: noop,
  closeConfirmDialog: noop,
});
