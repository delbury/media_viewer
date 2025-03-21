'use client';

import { useCallback, useRef, useState } from 'react';

const LOCAL_STORAGE_CONFIG_KEY = '_persistent_config';

let localConfig: Record<string, unknown> | null = null;
const initLocalConfig = () => {
  const item = window.localStorage.getItem(LOCAL_STORAGE_CONFIG_KEY);
  try {
    const itemObj = item ? JSON.parse(item) : {};
    localConfig = itemObj;
  } catch {
    window.localStorage.removeItem(LOCAL_STORAGE_CONFIG_KEY);
    localConfig = {};
  }
};
const getLocalConfig = (key?: string) => {
  if (!localConfig) initLocalConfig();

  if (!key) return null;

  return localConfig?.[key];
};
const setLocalConfig = (key: string, val?: unknown) => {
  if (!localConfig) initLocalConfig();

  if (localConfig) localConfig[key] = val;
};

export function usePersistentConfig<T = unknown>(defaultValue: T, key?: string): [T, (val: T) => void] {
  const [value, setValue] = useState(key ? ((getLocalConfig(key) as T) ?? defaultValue) : defaultValue);
  const cbId = useRef<number>(null);
  const setValueWithLocal = useCallback(
    (val: T) => {
      setValue(val);
      if (key && localConfig) {
        setLocalConfig(key, val);

        // 性能优化
        if (cbId.current) {
          window.cancelIdleCallback(cbId.current);
        }
        cbId.current = window.requestIdleCallback(() => {
          localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(localConfig));
          cbId.current = null;
        });
      }
    },
    [setValue, key]
  );

  return [value, setValueWithLocal];
}
