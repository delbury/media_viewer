'use client';

import { API_CONFIGS, ApiKeys, instance, TIMEOUT } from '@/request';
import { ApiResponseBase } from '@shared';
import { useNotifications } from '@toolpad/core';
import { AxiosError, AxiosResponse } from 'axios';
import { useCallback } from 'react';
import useSWR from 'swr';

export const useSwr = function <D = unknown>(
  apiKey: ApiKeys,
  options?: {
    lazy?: boolean;
  }
) {
  const { lazy = false } = options ?? {};
  const notifications = useNotifications();
  const { url, method } = API_CONFIGS[apiKey];
  const { data, isLoading, isValidating, mutate } = useSWR<
    AxiosResponse<ApiResponseBase<D>>,
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
    }
  );

  return {
    data,
    isLoading,
    isValidating,
    mutate,
    refresh: useCallback(() => mutate(), [mutate]),
  };
};
