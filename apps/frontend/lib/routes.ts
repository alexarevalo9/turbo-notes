export const routes = {
  home: '/',
  signup: '/signup',
  login: '/login',
  note: (id: number) => `/notes/${id}` as const,
} as const;

export type AppRoute = '/' | '/signup' | '/login' | `/notes/${number}`;
