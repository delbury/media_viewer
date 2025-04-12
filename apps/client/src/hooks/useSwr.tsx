'use client';

import { API_CONFIGS, ApiKeys, ApiResponseDataTypes, instance, TIMEOUT } from '#/request';
import { ApiRequestDataTypes, ApiRequestParamsTypes, ApiResponseBase } from '#pkgs/apis';
import { useNotifications } from '@toolpad/core';
import { AxiosError } from 'axios';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import useSWR, { KeyedMutator } from 'swr';

// export type * from '#pkgs/apis';

interface UseSwrOptions<T, P extends ApiKeys> {
  lazy?: boolean;
  onSuccess?: (data: ApiResponseBase<T>) => void;
  params?: ApiRequestParamsTypes<P>;
  data?: ApiRequestDataTypes<P>;
  noticeWhenSuccess?: boolean;
  disabled?: boolean;
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
  options?: UseSwrOptions<D, T>
): UseSwrReturnValue<D> {
  const {
    lazy = false,
    onSuccess,
    noticeWhenSuccess = lazy,
    params: requestParams,
    data: requestData,
    disabled,
  } = options ?? {};
  const t = useTranslations();
  const notifications = useNotifications();
  const { url, method } = API_CONFIGS[apiKey];
  const { data, isLoading, isValidating, mutate } = useSWR<
    ApiResponseBase<D>,
    AxiosError<ApiResponseBase>
  >(
    url,
    async () => {
      if (disabled) return null;
      const res = await instance.request({
        url,
        method,
        params: requestParams,
        data: requestData,
      });
      return res?.data;
    },
    {
      loadingTimeout: TIMEOUT,
      shouldRetryOnError: false,
      revalidateOnFocus: false,
      revalidateOnMount: !lazy && !disabled,
      onError: error => {
        notifications.show(error.response?.data?.msg || error.message, {
          autoHideDuration: 2000,
          severity: 'error',
        });
      },
      onSuccess: data => {
        onSuccess?.(data);
        if (noticeWhenSuccess) {
          notifications.show(t('Common.RequestSuccess'), {
            autoHideDuration: 1000,
            severity: 'success',
          });
        }
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
