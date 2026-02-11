import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticate, logout as logoutApi, refreshToken, getStoredTokens, storeTokens, clearTokens } from '../services/authApiClient';
import { setRefreshTokenCallback, setLogoutCallback } from '../services/adminApiClient';
import type { User, LoginResponse, AuthTokens } from '../types/auth';

interface AuthContextType {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshTokenValue, setRefreshTokenValue] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const stored = getStoredTokens();
        if (stored) {
          // Validate user object exists and has required fields
          if (stored.user && stored.user.id && stored.user.email && stored.user.role) {
            setAccessToken(stored.access_token);
            setRefreshTokenValue(stored.refresh_token);
            setUser(stored.user);
          } else {
            // Invalid stored data, clear it
            clearTokens();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearTokens();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      const response: LoginResponse = await authenticate(email, password);
      
      // Verify role is Admin
      if (response.user.role !== 'Admin') {
        clearTokens();
        throw new Error('Access denied. Admin role required.');
      }

      const tokens: AuthTokens = {
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        user: response.user,
      };

      storeTokens(tokens);
      setAccessToken(tokens.access_token);
      setRefreshTokenValue(tokens.refresh_token);
      setUser(tokens.user);
    } catch (error) {
      clearTokens();
      throw error;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      // Call logout API if we have a token
      if (accessToken) {
        try {
          await logoutApi(accessToken);
        } catch (error) {
          // Even if logout API fails, clear local state
          console.error('Logout API error:', error);
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state
      clearTokens();
      setAccessToken(null);
      setRefreshTokenValue(null);
      setUser(null);
      navigate('/login');
    }
  }, [accessToken, navigate]);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    // Prevent multiple simultaneous refresh attempts
    if (isRefreshing) {
      return accessToken;
    }

    if (!refreshTokenValue) {
      await logout();
      return null;
    }

    try {
      setIsRefreshing(true);
      const response = await refreshToken(refreshTokenValue);

      const tokens: AuthTokens = {
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        user: user!, // User should still exist if we have refresh token
      };

      storeTokens(tokens);
      setAccessToken(tokens.access_token);
      setRefreshTokenValue(tokens.refresh_token);

      return tokens.access_token;
    } catch (error) {
      // Refresh failed, logout user
      console.error('Token refresh failed:', error);
      await logout();
      return null;
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshTokenValue, user, isRefreshing, logout, accessToken]);

  // Register callbacks with adminApiClient for token refresh
  useEffect(() => {
    setRefreshTokenCallback(refreshAccessToken);
    setLogoutCallback(logout);
  }, [refreshAccessToken, logout]);

  const isAuthenticated = !!accessToken && !!user;
  const isAdmin = user?.role === 'Admin';

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        refreshToken: refreshTokenValue,
        user,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        logout,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
