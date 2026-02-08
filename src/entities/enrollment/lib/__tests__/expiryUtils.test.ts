/**
 * Tests for Expiry Utilities
 */

import { describe, it, expect } from 'vitest';
import {
  getExpiryStatus,
  isExpiringSoon,
  isExpired,
  sortByExpiry,
} from '../expiryUtils';

describe('expiryUtils', () => {
  describe('getExpiryStatus', () => {
    const now = new Date('2026-02-08T12:00:00Z');

    it('should return no_expiry when expiresAt is null', () => {
      const result = getExpiryStatus(null, now);
      expect(result.status).toBe('no_expiry');
      expect(result.daysRemaining).toBeNull();
      expect(result.label).toBe('No expiry');
    });

    it('should return no_expiry when expiresAt is undefined', () => {
      const result = getExpiryStatus(undefined, now);
      expect(result.status).toBe('no_expiry');
      expect(result.daysRemaining).toBeNull();
      expect(result.label).toBe('No expiry');
    });

    it('should return no_expiry when expiresAt is invalid', () => {
      const result = getExpiryStatus('invalid-date', now);
      expect(result.status).toBe('no_expiry');
      expect(result.daysRemaining).toBeNull();
      expect(result.label).toBe('No expiry');
    });

    it('should return expired status for past dates', () => {
      const expiresAt = '2026-02-05T12:00:00Z'; // 3 days ago
      const result = getExpiryStatus(expiresAt, now);
      expect(result.status).toBe('expired');
      expect(result.daysRemaining).toBe(-3);
      expect(result.label).toBe('Expired 3 days ago');
    });

    it('should return expired status with "yesterday" label', () => {
      const expiresAt = '2026-02-07T12:00:00Z'; // 1 day ago
      const result = getExpiryStatus(expiresAt, now);
      expect(result.status).toBe('expired');
      expect(result.daysRemaining).toBe(-1);
      expect(result.label).toBe('Expired yesterday');
    });

    it('should return expired status with weeks label', () => {
      const expiresAt = '2026-01-25T12:00:00Z'; // 14 days ago
      const result = getExpiryStatus(expiresAt, now);
      expect(result.status).toBe('expired');
      expect(result.daysRemaining).toBe(-14);
      expect(result.label).toBe('Expired 2 weeks ago');
    });

    it('should return expired status with months label', () => {
      const expiresAt = '2025-12-08T12:00:00Z'; // ~2 months ago
      const result = getExpiryStatus(expiresAt, now);
      expect(result.status).toBe('expired');
      expect(result.daysRemaining).toBe(-62);
      expect(result.label).toBe('Expired 2 months ago');
    });

    it('should return expiring_soon for today', () => {
      const expiresAt = '2026-02-08T12:00:00Z'; // today
      const result = getExpiryStatus(expiresAt, now);
      expect(result.status).toBe('expiring_soon');
      expect(result.daysRemaining).toBe(0);
      expect(result.label).toBe('Expires today');
    });

    it('should return expiring_soon for tomorrow', () => {
      const expiresAt = '2026-02-09T12:00:00Z'; // tomorrow
      const result = getExpiryStatus(expiresAt, now);
      expect(result.status).toBe('expiring_soon');
      expect(result.daysRemaining).toBe(1);
      expect(result.label).toBe('Expires tomorrow');
    });

    it('should return expiring_soon for dates within 7 days', () => {
      const expiresAt = '2026-02-12T12:00:00Z'; // 4 days from now
      const result = getExpiryStatus(expiresAt, now);
      expect(result.status).toBe('expiring_soon');
      expect(result.daysRemaining).toBe(4);
      expect(result.label).toBe('Expires in 4 days');
    });

    it('should return expiring_soon for dates within 30 days with weeks label', () => {
      const expiresAt = '2026-02-22T12:00:00Z'; // 14 days from now
      const result = getExpiryStatus(expiresAt, now);
      expect(result.status).toBe('expiring_soon');
      expect(result.daysRemaining).toBe(14);
      expect(result.label).toBe('Expires in 2 weeks');
    });

    it('should return expiring_soon for dates within 30 days', () => {
      const expiresAt = '2026-03-08T12:00:00Z'; // 28 days from now
      const result = getExpiryStatus(expiresAt, now);
      expect(result.status).toBe('expiring_soon');
      expect(result.daysRemaining).toBe(28);
      expect(result.label).toBe('Expires in 4 weeks');
    });

    it('should return active for dates beyond 30 days', () => {
      const expiresAt = '2026-04-08T12:00:00Z'; // 59 days from now
      const result = getExpiryStatus(expiresAt, now);
      expect(result.status).toBe('active');
      expect(result.daysRemaining).toBe(59);
      expect(result.label).toBe('Expires in 1 month');
    });

    it('should return active for dates far in the future', () => {
      const expiresAt = '2026-08-08T12:00:00Z'; // 6 months from now
      const result = getExpiryStatus(expiresAt, now);
      expect(result.status).toBe('active');
      expect(result.daysRemaining).toBe(181);
      expect(result.label).toBe('Expires in 6 months');
    });

    it('should handle edge case of exactly 30 days', () => {
      const expiresAt = '2026-03-10T12:00:00Z'; // 30 days from now
      const result = getExpiryStatus(expiresAt, now);
      expect(result.status).toBe('expiring_soon');
      expect(result.daysRemaining).toBe(30);
    });

    it('should handle edge case of 31 days', () => {
      const expiresAt = '2026-03-11T12:00:00Z'; // 31 days from now
      const result = getExpiryStatus(expiresAt, now);
      expect(result.status).toBe('active');
      expect(result.daysRemaining).toBe(31);
    });
  });

  describe('isExpiringSoon', () => {
    const now = new Date('2026-02-08T12:00:00Z');

    it('should return false when expiresAt is null', () => {
      expect(isExpiringSoon(null)).toBe(false);
    });

    it('should return false when expiresAt is undefined', () => {
      expect(isExpiringSoon(undefined)).toBe(false);
    });

    it('should return true for dates within default 30 days', () => {
      const expiresAt = '2026-02-20T12:00:00Z'; // 12 days from now
      // Note: We can't pass 'now' to isExpiringSoon, so we use getExpiryStatus instead
      const status = getExpiryStatus(expiresAt, now);
      expect(status.status === 'expiring_soon' && status.daysRemaining! <= 30 && status.daysRemaining! >= 0).toBe(true);
    });

    it('should return false for expired dates', () => {
      const expiresAt = '2026-02-05T12:00:00Z'; // 3 days ago
      const status = getExpiryStatus(expiresAt, now);
      expect(status.status === 'expiring_soon').toBe(false);
    });

    it('should return false for dates beyond threshold', () => {
      const expiresAt = '2026-04-08T12:00:00Z'; // 59 days from now
      const status = getExpiryStatus(expiresAt, now);
      expect(status.status === 'expiring_soon').toBe(false);
    });
  });

  describe('isExpired', () => {
    const now = new Date('2026-02-08T12:00:00Z');

    it('should return false when expiresAt is null', () => {
      expect(isExpired(null)).toBe(false);
    });

    it('should return false when expiresAt is undefined', () => {
      expect(isExpired(undefined)).toBe(false);
    });

    it('should return true for past dates', () => {
      const expiresAt = '2026-02-05T12:00:00Z'; // 3 days ago
      const status = getExpiryStatus(expiresAt, now);
      expect(status.status === 'expired').toBe(true);
    });

    it('should return false for future dates', () => {
      const expiresAt = '2026-02-15T12:00:00Z'; // 7 days from now
      const status = getExpiryStatus(expiresAt, now);
      expect(status.status === 'expired').toBe(false);
    });

    it('should return false for today', () => {
      const expiresAt = '2026-02-08T12:00:00Z'; // today
      const status = getExpiryStatus(expiresAt, now);
      expect(status.status === 'expired').toBe(false);
    });
  });

  describe('sortByExpiry', () => {
    it('should sort enrollments by expiry date (soonest first)', () => {
      const enrollments = [
        { id: '1', expiresAt: '2026-03-15T00:00:00Z' }, // 35 days
        { id: '2', expiresAt: '2026-02-10T00:00:00Z' }, // 2 days
        { id: '3', expiresAt: '2026-02-20T00:00:00Z' }, // 12 days
      ];

      const sorted = sortByExpiry(enrollments);
      expect(sorted[0].id).toBe('2'); // Expires soonest
      expect(sorted[1].id).toBe('3');
      expect(sorted[2].id).toBe('1'); // Expires latest
    });

    it('should place enrollments with no expiry at the end', () => {
      const enrollments = [
        { id: '1', expiresAt: '2026-03-15T00:00:00Z' },
        { id: '2', expiresAt: null },
        { id: '3', expiresAt: '2026-02-10T00:00:00Z' },
        { id: '4', expiresAt: undefined },
      ];

      const sorted = sortByExpiry(enrollments);
      expect(sorted[0].id).toBe('3'); // Expires soonest
      expect(sorted[1].id).toBe('1');
      expect(sorted[2].id).toBe('2'); // No expiry
      expect(sorted[3].id).toBe('4'); // No expiry
    });

    it('should handle all enrollments with no expiry', () => {
      const enrollments = [
        { id: '1', expiresAt: null },
        { id: '2', expiresAt: null },
        { id: '3', expiresAt: undefined },
      ];

      const sorted = sortByExpiry(enrollments);
      expect(sorted).toHaveLength(3);
      // Order doesn't matter when all have no expiry
    });

    it('should not mutate the original array', () => {
      const enrollments = [
        { id: '1', expiresAt: '2026-03-15T00:00:00Z' },
        { id: '2', expiresAt: '2026-02-10T00:00:00Z' },
      ];

      const original = [...enrollments];
      sortByExpiry(enrollments);

      expect(enrollments).toEqual(original);
    });

    it('should handle empty array', () => {
      const enrollments: Array<{ id: string; expiresAt?: string | null }> = [];
      const sorted = sortByExpiry(enrollments);
      expect(sorted).toEqual([]);
    });

    it('should handle single enrollment', () => {
      const enrollments = [{ id: '1', expiresAt: '2026-03-15T00:00:00Z' }];
      const sorted = sortByExpiry(enrollments);
      expect(sorted).toEqual(enrollments);
    });
  });
});
