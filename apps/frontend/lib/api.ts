import { createApiClient } from '@turbo-notes/types/client';
import qs from 'qs';

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
}

export function getApiClient(token?: string) {
  const client = createApiClient({
    baseUrl: getApiBaseUrl(),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    bodySerializer: (body) =>
      qs.stringify(body, {
        encodeValuesOnly: true,
      }),
    querySerializer(params) {
      return qs.stringify(params, {
        encodeValuesOnly: true,
      });
    },
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
