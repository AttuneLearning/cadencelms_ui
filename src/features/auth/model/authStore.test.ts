/**
 * Auth store tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from './authStore';
import { authApi } from '../api/authApi';

vi.mock('../api/authApi');

describe('authStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      accessToken: null,
      role: null,
      roles: [],
      isAuthenticated: false,
    });
    vi.clearAllMocks();
  });

  it('should have initial state', () => {
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe(null);
    expect(state.role).toBe(null);
    expect(state.roles).toEqual([]);
    expect(state.isAuthenticated).toBe(false);
  });

  it('should login successfully', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      accessToken: 'token123',
      role: 'learner',
      roles: ['learner'],
    });

    await useAuthStore.getState().login({
      email: 'test@example.com',
      password: 'password',
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBe('token123');
    expect(state.role).toBe('learner');
    expect(state.roles).toEqual(['learner']);
  });

  it('should handle login error', async () => {
    vi.mocked(authApi.login).mockRejectedValue(new Error('Invalid credentials'));

    await expect(
      useAuthStore.getState().login({
        email: 'test@example.com',
        password: 'wrong',
      })
    ).rejects.toThrow('Invalid credentials');

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBe(null);
  });

  it('should logout successfully', async () => {
    // Set authenticated state
    useAuthStore.setState({
      accessToken: 'token123',
      role: 'learner',
      roles: ['learner'],
      isAuthenticated: true,
    });

    vi.mocked(authApi.logout).mockResolvedValue();

    await useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBe(null);
    expect(state.role).toBe(null);
    expect(state.roles).toEqual([]);
  });

  it('should logout even if API call fails', async () => {
    useAuthStore.setState({
      accessToken: 'token123',
      role: 'learner',
      roles: ['learner'],
      isAuthenticated: true,
    });

    vi.mocked(authApi.logout).mockRejectedValue(new Error('Network error'));

    // The logout should throw but still clear state
    await expect(useAuthStore.getState().logout()).rejects.toThrow('Network error');

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBe(null);
  });

  it('should refresh token successfully', async () => {
    useAuthStore.setState({
      accessToken: 'oldToken',
      role: 'learner',
      roles: ['learner'],
      isAuthenticated: true,
    });

    vi.mocked(authApi.refresh).mockResolvedValue({
      accessToken: 'newToken',
    });

    await useAuthStore.getState().refreshToken();

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('newToken');
    expect(state.isAuthenticated).toBe(true);
  });

  it('should set token', () => {
    useAuthStore.getState().setToken('customToken');

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('customToken');
  });

  it('should check permission', () => {
    useAuthStore.setState({
      accessToken: 'token123',
      role: 'learner',
      roles: ['learner'],
      isAuthenticated: true,
    });

    const hasPermission = useAuthStore.getState().hasPermission('some-permission');
    expect(hasPermission).toBe(true);
  });

  it('should handle multiple roles', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      accessToken: 'token123',
      role: 'staff',
      roles: ['learner', 'staff'],
    });

    await useAuthStore.getState().login({
      email: 'staff@example.com',
      password: 'password',
    });

    const state = useAuthStore.getState();
    expect(state.role).toBe('staff');
    expect(state.roles).toEqual(['learner', 'staff']);
  });
});
