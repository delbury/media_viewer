'use client';

import { API_CONFIGS, ApiKeys, instance, TIMEOUT } from '@/request';
import { ApiResponseBase, DirTreeData, DirUpdateData } from '@shared';
import { useNotifications } from '@toolpad/core';
import { AxiosError } from 'axios';
import { useCallback } from 'react';
import useSWR, { KeyedMutator } from 'swr';

export type * from '@shared';

interface UseSwrOptions {
  lazy?: boolean;
}
interface UseSwrReturnValue<T> {
  data?: T;
  isLoading: boolean;
  isValidating: boolean;
  mutate: KeyedMutator<ApiResponseBase<T>>;
  refresh: () => void;
}

// 类型重载
function useSwr(key: 'dirUpdate', options?: UseSwrOptions): UseSwrReturnValue<DirUpdateData>;
function useSwr(key: 'dirTree', options?: UseSwrOptions): UseSwrReturnValue<DirTreeData>;

function useSwr<D extends Record<string, unknown> = Record<string, unknown>>(
  apiKey: ApiKeys,
  options?: UseSwrOptions
): UseSwrReturnValue<D> {
  const { lazy = false } = options ?? {};
  const notifications = useNotifications();
  const { url, method } = API_CONFIGS[apiKey];
  const { data, isLoading, isValidating, mutate } = useSWR<ApiResponseBase<D>, AxiosError<ApiResponseBase>>(
    url,
    async () => {
      const res = await instance.request({
        url,
        method,
      });
      return res?.data;
    },
    {
      loadingTimeout: TIMEOUT,
      shouldRetryOnError: false,
      revalidateOnFocus: false,
      revalidateOnMount: !lazy,
      onError: error => {
        notifications.show(error.response?.data?.msg || error.message, {
          autoHideDuration: 2000,
          severity: 'error',
        });
      },
    }
  );

  return {
    data: data?.data,
    isLoading,
    isValidating,
    mutate,
    refresh: useCallback(() => mutate(), [mutate]),
  };
}

export { useSwr };
