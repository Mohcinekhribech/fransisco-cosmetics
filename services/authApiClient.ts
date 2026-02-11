/**
 * Authentication API Client
 * Handles login, logout, token refresh, and localStorage token management
 */

import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  AuthTokens,
} from '../types/auth';

const getBaseUrl = (): string => {
  const url = (import.meta.env as any).VITE_API_BASE_URL as string | undefined;
  if (!url) return '';
  return url.replace(/\/$/, '');
};

const api = (path: string, init?: RequestInit): Promise<Response> => {
  const base = getBaseUrl();
  if (!base) return Promise.reject(new Error('VITE_API_BASE_URL is not set'));
  const url = `${base}/api${path}`;
  return fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
};

const post = <T>(path: string, body: unknown, headers?: HeadersInit): Promise<T> =>
  api(path, { method: 'POST', body: JSON.stringify(body), headers }).then(async (res) => {
    if (!res.ok) {
      const text = await res.text();
      throw new Error(res.status === 400 ? text || 'Bad request' : `API error: ${res.status}`);
    }
    return res.json();
  });

// ========== AUTHENTICATION ==========

/** Login - POST /api/auth/authenticate */
export const authenticate = async (email: string, password: string): Promise<LoginResponse> => {
  const body: LoginRequest = { email, password };
  return post<LoginResponse>('/auth/authenticate', body);
};

/** Logout - POST /api/auth/logout */
export const logout = async (accessToken: string): Promise<void> => {
  await post<void>(
    '/auth/logout',
    {},
    {
      Authorization: `Bearer ${accessToken}`,
    }
  );
};

/** Refresh token - POST /api/auth/refresh-token */
export const refreshToken = async (refreshToken: string): Promise<RefreshTokenResponse> => {
  const body: RefreshTokenRequest = { refresh_token: refreshToken };
  return post<RefreshTokenResponse>('/auth/refresh-token', body);
};

// ========== TOKEN STORAGE ==========

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'admin_access_token',
  REFRESH_TOKEN: 'admin_refresh_token',
  USER: 'admin_user',
} as const;

/** Get stored tokens from localStorage */
export const getStoredTokens = (): AuthTokens | null => {
  try {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);

    if (!accessToken || !refreshToken || !userStr) {
      return null;
    }

    const user = JSON.parse(userStr);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user,
    };
  } catch (error) {
    console.error('Error reading tokens from localStorage:', error);
    return null;
  }
};

/** Store tokens in localStorage */
export const storeTokens = (tokens: AuthTokens): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(tokens.user));
  } catch (error) {
    console.error('Error storing tokens in localStorage:', error);
    throw new Error('Failed to store authentication tokens');
  }
};

/** Clear all tokens from localStorage */
export const clearTokens = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  } catch (error) {
    console.error('Error clearing tokens from localStorage:', error);
  }
};

/** Get access token from localStorage */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

/** Get refresh token from localStorage */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
};
