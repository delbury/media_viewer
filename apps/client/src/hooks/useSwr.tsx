'use client';

import { API_CONFIGS, ApiKeys, instance, TIMEOUT } from '#/request';
import { ApiResponseBase, DirectoryInfo, DirUpdateData } from '#pkgs/shared';
import { useNotifications } from '@toolpad/core';
import { AxiosError } from 'axios';
import { useCallback } from 'react';
import useSWR, { KeyedMutator } from 'swr';

export type * from '#pkgs/shared';

interface UseSwrOptions<T> {
  lazy?: boolean;
  onSuccess?: (data: ApiResponseBase<T>) => void;
}
interface UseSwrReturnValue<T> {
  data?: T;
  isLoading: boolean;
  isValidating: boolean;
  mutate: KeyedMutator<ApiResponseBase<T>>;
  refresh: () => void;
}

// 类型重载
function useSwr<T = DirUpdateData>(
  key: 'dirUpdate',
  options?: UseSwrOptions<T>
): UseSwrReturnValue<Pick<DirUpdateData, 'treeNode'>>;
function useSwr<T = DirectoryInfo>(
  key: 'dirTree',
  options?: UseSwrOptions<T>
): UseSwrReturnValue<DirectoryInfo>;

function useSwr<D extends Record<string, unknown> = Record<string, unknown>>(
  apiKey: ApiKeys,
  options?: UseSwrOptions<D>
): UseSwrReturnValue<D> {
  const { lazy = false, onSuccess } = options ?? {};
  const notifications = useNotifications();
  const { url, method } = API_CONFIGS[apiKey];
  const { data, isLoading, isValidating, mutate } = useSWR<
    ApiResponseBase<D>,
    AxiosError<ApiResponseBase>
  >(
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
      ...(onSuccess ? { onSuccess } : {}),
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
