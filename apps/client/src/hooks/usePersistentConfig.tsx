'use client';

import { useCallback, useEffect, useState } from 'react';
import { useIdleCallback } from './useIdleCallback';

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
const saveLocalConfig = () => {
  localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(localConfig));
};

export function usePersistentConfig<T = unknown>(
  defaultValue: T,
  storageKey?: string | { prefix?: string; suffix?: string }
): [T, (val: T) => void] {
  const key =
    typeof storageKey === 'object'
      ? `${storageKey.prefix || ''}${storageKey.suffix || ''}`
      : storageKey;

  const [value, setValue] = useState<T>(defaultValue);

  // 初始化
  useEffect(() => {
    setValue(key ? ((getLocalConfig(key) as T) ?? defaultValue) : defaultValue);
  }, []);

  const saveLocalConfigIdle = useIdleCallback(saveLocalConfig, 1000);

  const setValueWithLocal = useCallback(
    (val: T) => {
      setValue(val);
      if (key && localConfig) {
        setLocalConfig(key, val);

        saveLocalConfigIdle();
      }
    },
    [key, saveLocalConfigIdle]
  );

  return [value, setValueWithLocal];
}
