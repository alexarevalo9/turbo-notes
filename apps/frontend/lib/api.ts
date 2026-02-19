import { createApiClient } from '@turbo-notes/types/client';

export function getApiClient(token?: string) {
  const client = createApiClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000',
  });

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
