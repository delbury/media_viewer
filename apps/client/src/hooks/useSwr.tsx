'use client';

import { API_CONFIGS, ApiKeys, instance } from '@/request';
import { ApiResponseBase } from '@shared';
import { useNotifications } from '@toolpad/core';
import { AxiosError, AxiosResponse } from 'axios';
import useSWR from 'swr';

export const useSwr = function <D = unknown>(apiKey: ApiKeys) {
  const notifications = useNotifications();

  const { url, method } = API_CONFIGS[apiKey];

  const { data, isLoading, isValidating, mutate } = useSWR<AxiosResponse<ApiResponseBase<D>>, AxiosError>(
    url,
    async () => {
      const res = await instance.request({
        url,
        method,
      });
      return res?.data;
    },
    {
      shouldRetryOnError: false,
      onError: error => {
        notifications.show(error.message, {
          autoHideDuration: 3000,
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
  };
};
