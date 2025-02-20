import { ApiResponseBase } from '#pkgs/shared';

export const returnBody = function <T>(data?: T) {
  return {
    code: 0,
    data,
  } satisfies ApiResponseBase<T>;
};

export const returnError = function <T>(msg: string, code?: number) {
  return {
    code: code ?? 1,
    msg,
  } satisfies ApiResponseBase<T>;
};
