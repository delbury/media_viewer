'use client';

import { API_CONFIGS, ApiKeys, ApiResponseDataTypes, instance, TIMEOUT } from '#/request';
import { ApiResponseBase } from '#pkgs/shared';
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

function useSwr<T extends ApiKeys, D = ApiResponseDataTypes<T>>(
  apiKey: T,
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
