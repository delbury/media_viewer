import { ApiResponseBase } from '#pkgs/apis';
import { ERROR_MSG } from '#pkgs/i18n/errorMsg';
import { isNil } from 'lodash-es';
import { createHash } from 'node:crypto';

export const returnBody = <T>(data?: T) => {
  return {
    code: 0,
    data,
  } satisfies ApiResponseBase<T>;
};

export const returnError = <T>(msg: string, code?: number) => {
  return {
    code: code ?? 1,
    msg,
  } satisfies ApiResponseBase<T>;
};

// 合法的数字字符串
export const validateNumberString = (ns?: string) => {
  if (isNil(ns)) throw new Error(ERROR_MSG.required);
  const num = +ns;
  if (Number.isNaN(num)) throw new Error(ERROR_MSG.notANumber);
  return num;
};

// 生成 hash
export const generateHash = (text: string) =>
  createHash('md5').update(text).digest('hex').substring(0, 8);
