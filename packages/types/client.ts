import createClient, { type ClientOptions } from 'openapi-fetch';

import type { paths } from './index';

export function createApiClient(options?: ClientOptions) {
  return createClient<paths>(options);
}

export type { paths, components, operations } from './index';
