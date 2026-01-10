/**
 * Auth API client
 * Handles authentication-related API calls
 */

import { client } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type { LoginCredentials, AuthResponse, User } from '../model/types';

export const authApi = {
  /**
   * Login with email and password
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    console.log('[authApi] Login request:', {
      endpoint: endpoints.auth.login,
      email: credentials.email,
      passwordLength: credentials.password.length,
    });
    try {
      const response = await client.post(endpoints.auth.login, credentials);
      console.log('[authApi] Login response:', {
        status: response.status,
        data: response.data,
      });
      return response.data;
    } catch (error: any) {
      console.error('[authApi] Login error:', {
        message: error?.message,
        status: error?.status,
        response: error?.response?.data,
      });
      throw error;
    }
  },

  /**
   * Refresh access token using refresh token cookie
   */
  refresh: async (): Promise<{ accessToken: string }> => {
    const response = await client.post(endpoints.auth.refresh);
    return response.data;
  },

  /**
   * Logout and invalidate refresh token
   */
  logout: async (): Promise<void> => {
    await client.post(endpoints.auth.logout);
  },

  /**
   * Get current user information
   */
  me: async (): Promise<User> => {
    const response = await client.get(endpoints.auth.me);
    return response.data;
  },
};
