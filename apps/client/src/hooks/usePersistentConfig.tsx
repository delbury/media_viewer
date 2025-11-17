'use client';

import { useCallback, useState, useSyncExternalStore } from 'react';
import { useIdleCallback } from './useIdleCallback';

const LOCAL_STORAGE_CONFIG_KEY = '_persistent_config';

const STORE = {
  localConfig: null as Record<string, unknown> | null,
  // 临时配置，需要手动保存到本地
  tempConfig: {} as Record<string, unknown>,
  // 合并配置
  mergeConfig: {} as Record<string, unknown>,
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
  return STORE.mergeConfig;
};

const initLocalConfig = () => {
  const item = window?.localStorage.getItem(LOCAL_STORAGE_CONFIG_KEY);
  try {
    const itemObj = item ? JSON.parse(item) : {};
    STORE.localConfig = itemObj;
    STORE.mergeConfig = { ...itemObj };
  } catch {
    window?.localStorage.removeItem(LOCAL_STORAGE_CONFIG_KEY);
    STORE.localConfig = {};
  }
};
const getLocalConfig = (key?: string) => {
  if (!STORE.localConfig) initLocalConfig();

  if (!key) return null;

  return STORE.mergeConfig?.[key];
};
const setLocalConfig = (key: string, val?: unknown, lazySet?: boolean) => {
  if (!STORE.localConfig) initLocalConfig();

  if (lazySet) {
    // 懒设置到临时配置中
    STORE.tempConfig[key] = val;
    STORE.tempConfig = { ...STORE.tempConfig };
  } else if (STORE.localConfig) {
    STORE.localConfig[key] = val;
    STORE.localConfig = { ...STORE.localConfig };
  }

  STORE.mergeConfig = {
    ...STORE.localConfig,
    ...STORE.tempConfig,
  };

  listeners.values().forEach(fn => fn());
};
// 将内存配置保存到本地
const saveLocalConfig = () => {
  localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(STORE.localConfig));
};
// 将对应 key 的临时配置保存到本地
export const saveTempConfigByKey = (keys: string | string[]) => {
  const configs: Record<string, unknown> = {};
  keys = Array.isArray(keys) ? keys : [keys];

  for (const k of keys) {
    if (k in STORE.tempConfig) configs[k] = STORE.tempConfig[k];
  }

  localStorage.setItem(
    LOCAL_STORAGE_CONFIG_KEY,
    JSON.stringify({
      ...STORE.localConfig,
      ...configs,
    })
  );
};

export function usePersistentConfig<T = unknown>(
  defaultValue: T,
  storageKey?: string | { prefix?: string; suffix?: string },
  { lazySave }: { lazySave?: boolean } = {}
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

  const setLocalConfigIdle = useIdleCallback(setLocalConfig, 1000);
  const saveLocalConfigIdle = useIdleCallback(saveLocalConfig, 1000);

  const setValueWithLocal = useCallback(
    (val: T) => {
      setValue(val);
      if (key && STORE.localConfig) {
        setLocalConfigIdle(key, val, lazySave);
        if (!lazySave) saveLocalConfigIdle();
      }
    },
    [key, lazySave, setLocalConfigIdle, saveLocalConfigIdle]
  );

  return [value, setValueWithLocal];
}

const getServerSnapshot = () => STORE.mergeConfig;

export const usePersistentConfigValue = function <T>(key: string) {
  if (!STORE.localConfig && typeof window !== 'undefined') initLocalConfig();

  const config = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return config?.[key] as T;
};

export const usePersistentConfigStore = function () {
  if (!STORE.localConfig && typeof window !== 'undefined') initLocalConfig();

  const config = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return config;
};
