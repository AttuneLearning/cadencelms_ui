/**
 * Admin Token Storage Tests
 * Version: 1.0.0
 * Date: 2026-01-11
 *
 * Comprehensive test suite for admin token storage
 * Validates memory-only storage, auto-expiry, and security requirements
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  setAdminToken,
  getAdminToken,
  clearAdminToken,
  hasAdminToken,
  getAdminTokenExpiry,
  getTimeUntilExpiration,
} from '../adminTokenStorage';

describe('adminTokenStorage', () => {
  beforeEach(() => {
    // Clear any existing admin token before each test
    clearAdminToken();
    // Clear all timers
    vi.clearAllTimers();
  });

  afterEach(() => {
    // Clean up after each test
    clearAdminToken();
    vi.clearAllTimers();
  });

  describe('setAdminToken', () => {
    it('should store admin token in memory', () => {
      const token = 'test_admin_token';
      setAdminToken(token, 900);

      expect(getAdminToken()).toBe(token);
      expect(hasAdminToken()).toBe(true);
    });

    it('should set expiry timestamp correctly', () => {
      const token = 'test_admin_token';
      const expiresIn = 900; // 15 minutes
      const beforeSet = Date.now();

      setAdminToken(token, expiresIn);

      const expiry = getAdminTokenExpiry();
      expect(expiry).not.toBeNull();

      if (expiry) {
        const expiryTime = expiry.getTime();
        const expectedExpiry = beforeSet + expiresIn * 1000;
        // Allow 100ms tolerance for test execution time
        expect(expiryTime).toBeGreaterThanOrEqual(expectedExpiry - 100);
        expect(expiryTime).toBeLessThanOrEqual(expectedExpiry + 100);
      }
    });

    it('should throw error for empty token', () => {
      expect(() => setAdminToken('', 900)).toThrow('Admin token cannot be empty');
    });

    it('should throw error for invalid expiration', () => {
      expect(() => setAdminToken('token', 0)).toThrow('Expiration time must be positive');
      expect(() => setAdminToken('token', -100)).toThrow('Expiration time must be positive');
    });

    it('should replace existing token', () => {
      setAdminToken('token1', 900);
      expect(getAdminToken()).toBe('token1');

      setAdminToken('token2', 900);
      expect(getAdminToken()).toBe('token2');
    });

    it('should clear previous timeout when setting new token', () => {
      vi.useFakeTimers();

      setAdminToken('token1', 1); // 1 second
      setAdminToken('token2', 10); // 10 seconds

      // Advance 2 seconds - first timeout should not fire
      vi.advanceTimersByTime(2000);
      expect(getAdminToken()).toBe('token2');

      // Advance to 11 seconds - second timeout should fire
      vi.advanceTimersByTime(9000);
      expect(getAdminToken()).toBeNull();

      vi.useRealTimers();
    });
  });

  describe('getAdminToken', () => {
    it('should return null when no token is set', () => {
      expect(getAdminToken()).toBeNull();
    });

    it('should return token when valid', () => {
      const token = 'test_admin_token';
      setAdminToken(token, 900);

      expect(getAdminToken()).toBe(token);
    });

    it('should return null when token is expired', () => {
      vi.useFakeTimers();

      const token = 'test_admin_token';
      setAdminToken(token, 1); // 1 second

      expect(getAdminToken()).toBe(token);

      // Advance time past expiry
      vi.advanceTimersByTime(2000);

      expect(getAdminToken()).toBeNull();

      vi.useRealTimers();
    });

    it('should clear token when checking expired token', () => {
      vi.useFakeTimers();

      setAdminToken('token', 1);

      // Advance past expiry
      vi.advanceTimersByTime(2000);

      // First call returns null and clears
      expect(getAdminToken()).toBeNull();

      // Second call should still be null
      expect(getAdminToken()).toBeNull();

      vi.useRealTimers();
    });
  });

  describe('clearAdminToken', () => {
    it('should clear admin token from memory', () => {
      setAdminToken('token', 900);
      expect(hasAdminToken()).toBe(true);

      clearAdminToken();
      expect(hasAdminToken()).toBe(false);
      expect(getAdminToken()).toBeNull();
    });

    it('should clear expiry timestamp', () => {
      setAdminToken('token', 900);
      expect(getAdminTokenExpiry()).not.toBeNull();

      clearAdminToken();
      expect(getAdminTokenExpiry()).toBeNull();
    });

    it('should cancel auto-expiry timeout', () => {
      vi.useFakeTimers();

      setAdminToken('token', 1);
      clearAdminToken();

      // Advance past expiry time
      vi.advanceTimersByTime(2000);

      // Token should still be null (not reset by timeout)
      expect(getAdminToken()).toBeNull();

      vi.useRealTimers();
    });

    it('should be safe to call multiple times', () => {
      clearAdminToken();
      clearAdminToken();
      clearAdminToken();

      expect(getAdminToken()).toBeNull();
    });

    it('should be safe to call when no token is set', () => {
      expect(() => clearAdminToken()).not.toThrow();
    });
  });

  describe('hasAdminToken', () => {
    it('should return false when no token is set', () => {
      expect(hasAdminToken()).toBe(false);
    });

    it('should return true when valid token exists', () => {
      setAdminToken('token', 900);
      expect(hasAdminToken()).toBe(true);
    });

    it('should return false when token is expired', () => {
      vi.useFakeTimers();

      setAdminToken('token', 1);
      expect(hasAdminToken()).toBe(true);

      vi.advanceTimersByTime(2000);
      expect(hasAdminToken()).toBe(false);

      vi.useRealTimers();
    });

    it('should return false after clearing token', () => {
      setAdminToken('token', 900);
      expect(hasAdminToken()).toBe(true);

      clearAdminToken();
      expect(hasAdminToken()).toBe(false);
    });
  });

  describe('getAdminTokenExpiry', () => {
    it('should return null when no token is set', () => {
      expect(getAdminTokenExpiry()).toBeNull();
    });

    it('should return expiry Date when token is set', () => {
      setAdminToken('token', 900);
      const expiry = getAdminTokenExpiry();

      expect(expiry).not.toBeNull();
      expect(expiry).toBeInstanceOf(Date);
    });

    it('should return null after clearing token', () => {
      setAdminToken('token', 900);
      clearAdminToken();

      expect(getAdminTokenExpiry()).toBeNull();
    });
  });

  describe('getTimeUntilExpiration', () => {
    it('should return 0 when no token is set', () => {
      expect(getTimeUntilExpiration()).toBe(0);
    });

    it('should return time remaining in milliseconds', () => {
      vi.useFakeTimers();

      const expiresIn = 900; // 15 minutes
      setAdminToken('token', expiresIn);

      const timeRemaining = getTimeUntilExpiration();
      expect(timeRemaining).toBeGreaterThan(0);
      expect(timeRemaining).toBeLessThanOrEqual(expiresIn * 1000);

      vi.useRealTimers();
    });

    it('should decrease as time passes', () => {
      vi.useFakeTimers();

      setAdminToken('token', 10); // 10 seconds

      const time1 = getTimeUntilExpiration();
      vi.advanceTimersByTime(5000); // Advance 5 seconds
      const time2 = getTimeUntilExpiration();

      expect(time2).toBeLessThan(time1);
      expect(time1 - time2).toBeGreaterThanOrEqual(4900); // ~5 seconds
      expect(time1 - time2).toBeLessThanOrEqual(5100);

      vi.useRealTimers();
    });

    it('should return 0 when token is expired', () => {
      vi.useFakeTimers();

      setAdminToken('token', 1);
      vi.advanceTimersByTime(2000);

      expect(getTimeUntilExpiration()).toBe(0);

      vi.useRealTimers();
    });
  });

  describe('auto-expiry', () => {
    it('should auto-clear token after expiry time', () => {
      vi.useFakeTimers();

      setAdminToken('token', 1); // 1 second
      expect(hasAdminToken()).toBe(true);

      // Advance past expiry
      vi.advanceTimersByTime(1500);

      expect(hasAdminToken()).toBe(false);
      expect(getAdminToken()).toBeNull();

      vi.useRealTimers();
    });

    it('should auto-clear at correct time', () => {
      vi.useFakeTimers();

      const expiresIn = 5; // 5 seconds
      setAdminToken('token', expiresIn);

      // Before expiry
      vi.advanceTimersByTime(4000);
      expect(hasAdminToken()).toBe(true);

      // After expiry
      vi.advanceTimersByTime(2000);
      expect(hasAdminToken()).toBe(false);

      vi.useRealTimers();
    });
  });

  describe('security validation', () => {
    it('should NEVER store token in localStorage', () => {
      setAdminToken('secret_admin_token', 900);

      // Check that localStorage does NOT contain admin token
      const localStorageKeys = Object.keys(localStorage);
      for (const key of localStorageKeys) {
        const value = localStorage.getItem(key);
        if (value) {
          expect(value).not.toContain('secret_admin_token');
        }
        expect(key).not.toContain('admin');
      }
    });

    it('should NEVER store token in sessionStorage', () => {
      setAdminToken('secret_admin_token', 900);

      // Check that sessionStorage does NOT contain admin token
      const sessionStorageKeys = Object.keys(sessionStorage);
      for (const key of sessionStorageKeys) {
        const value = sessionStorage.getItem(key);
        if (value) {
          expect(value).not.toContain('secret_admin_token');
        }
        expect(key).not.toContain('admin');
      }
    });

    it('should be lost on page refresh (memory only)', () => {
      // This is a conceptual test - in actual page refresh,
      // the module would be reloaded and all memory cleared
      setAdminToken('token', 900);
      expect(hasAdminToken()).toBe(true);

      // Simulate module reload by clearing
      clearAdminToken();
      expect(hasAdminToken()).toBe(false);

      // No way to recover token (intentional)
      expect(getAdminToken()).toBeNull();
    });

    it('should not leak token through window object', () => {
      setAdminToken('secret_token', 900);

      // Check window object doesn't expose token
      const windowObj = window as any;
      expect(windowObj.adminToken).toBeUndefined();
      expect(windowObj.__adminToken).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle very short expiry times', () => {
      vi.useFakeTimers();

      setAdminToken('token', 0.1); // 100ms
      expect(hasAdminToken()).toBe(true);

      vi.advanceTimersByTime(200);
      expect(hasAdminToken()).toBe(false);

      vi.useRealTimers();
    });

    it('should handle very long expiry times', () => {
      const oneDay = 24 * 60 * 60; // 1 day in seconds
      setAdminToken('token', oneDay);

      expect(hasAdminToken()).toBe(true);

      const timeRemaining = getTimeUntilExpiration();
      expect(timeRemaining).toBeGreaterThan(oneDay * 1000 - 1000); // Within 1 second tolerance
    });

    it('should handle concurrent set operations', () => {
      setAdminToken('token1', 900);
      setAdminToken('token2', 900);
      setAdminToken('token3', 900);

      expect(getAdminToken()).toBe('token3');
    });
  });
});
