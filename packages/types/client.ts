import createClient, { type ClientOptions } from 'openapi-fetch';

import type { paths } from './index';

export function createApiClient(options?: ClientOptions) {
  return createClient<paths>({
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000',
    ...options,
  });
}

export type { paths, components, operations } from './index';
