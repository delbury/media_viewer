export interface ApiResponseBase<T = unknown> {
  msg: string;
  code: number;
  data: T;
}
