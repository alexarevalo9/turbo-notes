import { createApiClient } from '@turbo-notes/types/client';

export function getApiClient(token?: string) {
  const client = createApiClient();

  if (token) {
    client.use({
      onRequest({ request }) {
        request.headers.set('Authorization', `Bearer ${token}`);
        return request;
      },
    });
  }

  return client;
}
