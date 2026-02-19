export const routes = {
  home: '/',
  signup: '/signup',
  login: '/login',
} as const;

export type AppRoute = (typeof routes)[keyof typeof routes];
