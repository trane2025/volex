import type { CookieOptions, Response } from 'express';

export const ACCESS_TOKEN_MAX_AGE = 20 * 60 * 1000;
export const REFRESH_SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export const accessTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

export const refreshTokenCookieOptions: CookieOptions = {
  ...accessTokenCookieOptions,
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie('accessToken', accessTokenCookieOptions);
  res.clearCookie('refreshToken', refreshTokenCookieOptions);
};
