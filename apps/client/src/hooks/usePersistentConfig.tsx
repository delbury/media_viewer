'use client';

import { useCallback, useState, useSyncExternalStore } from 'react';
import { useIdleCallback } from './useIdleCallback';

const LOCAL_STORAGE_CONFIG_KEY = '_persistent_config';

const STORE = {
  localConfig: null as Record<string, unknown> | null,
};

const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  // 返回一个取消订阅的函数
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => {
  return STORE.localConfig;
};

const initLocalConfig = () => {
  const item = window?.localStorage.getItem(LOCAL_STORAGE_CONFIG_KEY);
  try {
    const itemObj = item ? JSON.parse(item) : {};
    STORE.localConfig = itemObj;
  } catch {
    window?.localStorage.removeItem(LOCAL_STORAGE_CONFIG_KEY);
    STORE.localConfig = {};
  }
};
const getLocalConfig = (key?: string) => {
  if (!STORE.localConfig) initLocalConfig();

  if (!key) return null;

  return STORE.localConfig?.[key];
};
const setLocalConfig = (key: string, val?: unknown) => {
  if (!STORE.localConfig) initLocalConfig();

  if (STORE.localConfig) {
    STORE.localConfig[key] = val;
    STORE.localConfig = { ...STORE.localConfig };
  }

  listeners.values().forEach(fn => fn());
};
const saveLocalConfig = () => {
  localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(STORE.localConfig));
};

export function usePersistentConfig<T = unknown>(
  defaultValue: T,
  storageKey?: string | { prefix?: string; suffix?: string }
): [T, (val: T) => void] {
  const key =
    typeof storageKey === 'object'
      ? `${storageKey.prefix || ''}${storageKey.suffix || ''}`
      : storageKey;

  const [value, setValue] = useState<T>(
    key ? ((getLocalConfig(key) as T) ?? defaultValue) : defaultValue
  );

  // 初始化
  // useEffect(() => {
  //   setValue(key ? ((getLocalConfig(key) as T) ?? defaultValue) : defaultValue);
  // }, []);

  const saveLocalConfigIdle = useIdleCallback(saveLocalConfig, 1000);

  const setValueWithLocal = useCallback(
    (val: T) => {
      setValue(val);
      if (key && STORE.localConfig) {
        setLocalConfig(key, val);

        saveLocalConfigIdle();
      }
    },
    [key, saveLocalConfigIdle]
  );

  return [value, setValueWithLocal];
}

export const usePersistentConfigValue = function <T>(key: string) {
  const config = useSyncExternalStore(subscribe, getSnapshot);
  return config?.[key] as T;
};
