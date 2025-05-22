'use client';

import { API_CONFIGS, ApiKeys, ApiResponseDataTypes, instance } from '#/request';
import { ApiRequestDataTypes, ApiRequestParamsTypes, ApiResponseBase } from '#pkgs/apis';
import { REQUEST_TIMEOUT } from '#pkgs/tools/constant';
import { AxiosError } from 'axios';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import useSWR, { KeyedMutator } from 'swr';
import useSWRMutation from 'swr/mutation';
import { useMessage } from './useMessage';

const AUTO_HIDE_DURATION_ERROR = 2000;
const AUTO_HIDE_DURATION_SUCCESS = 1000;

interface UseSwrOptions<T, P extends ApiKeys> {
  key?: string;
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
}

const useSwr = <T extends ApiKeys, D = ApiResponseDataTypes<T>>(
  apiKey: T,
  options?: UseSwrOptions<D, T>
): UseSwrReturnValue<D> => {
  const {
    lazy = false,
    onSuccess,
    noticeWhenSuccess,
    params: requestParams,
    data: requestData,
    disabled,
    key,
  } = options ?? {};
  const t = useTranslations();
  const msg = useMessage();
  const { url, method } = API_CONFIGS[apiKey];
  const { data, isLoading, isValidating, mutate } = useSWR<
    ApiResponseBase<D>,
    AxiosError<ApiResponseBase>
  >(
    disabled ? null : (key ?? [url, requestParams, requestData]),
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
      loadingTimeout: REQUEST_TIMEOUT,
      shouldRetryOnError: false,
      revalidateOnFocus: false,
      revalidateOnMount: !lazy && !disabled,
      onError: error => {
        msg.show({
          message: error.response?.data?.msg || error.message,
          type: 'error',
        });
      },
      onSuccess: data => {
        onSuccess?.(data);
        if (noticeWhenSuccess) {
          msg.show({
            message: t('Common.RequestSuccess'),
            type: 'success',
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
  };
};

type MutationArgs<T, P extends ApiKeys> = Pick<UseSwrOptions<T, P>, 'data' | 'params'>;
const useSwrMutation = <T extends ApiKeys, D = ApiResponseDataTypes<T>>(
  apiKey: T,
  options?: Pick<UseSwrOptions<D, T>, 'data' | 'params' | 'onSuccess' | 'noticeWhenSuccess'>
) => {
  const { onSuccess, noticeWhenSuccess, params: requestParams, data: requestData } = options ?? {};
  const t = useTranslations();
  const msg = useMessage();
  const { url, method } = API_CONFIGS[apiKey];
  const {
    data,
    isMutating: isLoading,
    trigger,
    reset,
  } = useSWRMutation(
    url,
    async (url: string, { arg: { params, data } }: { arg: MutationArgs<D, T> }) => {
      const res = await instance.request<ApiResponseBase<D>>({
        url,
        method,
        params: params ?? requestParams,
        data: data ?? requestData,
      });
      return res?.data;
    },
    {
      onError: (error: AxiosError<ApiResponseBase>) => {
        msg.show({
          message: error.response?.data?.msg || error.message,
          type: 'error',
        });
      },
      onSuccess: data => {
        onSuccess?.(data);
        if (noticeWhenSuccess) {
          msg.show({
            message: t('Common.RequestSuccess'),
            type: 'success',
          });
        }
      },
    }
  );

  const wrappedTrigger = useCallback(
    (arg: MutationArgs<D, T> = {}) => {
      return trigger(arg);
    },
    [trigger]
  );

  return {
    data: data?.data,
    isLoading,
    trigger: wrappedTrigger,
    reset,
  };
};

export { useSwr, useSwrMutation };
