import { Method } from 'axios';

export interface ApiConfig {
  url: string;
  method: Method;
}

export const API_CONFIGS = {
  dirUpdate: {
    url: '/dir/update',
    method: 'get',
  },
  dirTree: {
    url: '/dir/tree',
    method: 'get',
  },
} satisfies Record<string, ApiConfig>;

export type ApiKeys = keyof typeof API_CONFIGS;
