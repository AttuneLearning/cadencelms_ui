/**
 * Tests for Timer Utilities
 */

import { describe, it, expect } from 'vitest';
import {
  formatTime,
  formatTimeRemaining,
  isTimeLow,
  isTimeExpired,
  calculateTimeSpent,
  calculateRemainingTime,
} from '../timerUtils';

describe('timerUtils', () => {
  describe('formatTime', () => {
    it('should format seconds to HH:MM:SS', () => {
      expect(formatTime(3665)).toBe('01:01:05');
      expect(formatTime(3600)).toBe('01:00:00');
      expect(formatTime(60)).toBe('00:01:00');
      expect(formatTime(5)).toBe('00:00:05');
    });

    it('should handle 0 seconds', () => {
      expect(formatTime(0)).toBe('00:00:00');
    });

    it('should handle large durations', () => {
      expect(formatTime(36000)).toBe('10:00:00');
      expect(formatTime(86399)).toBe('23:59:59');
    });

    it('should pad single digits with zeros', () => {
      expect(formatTime(61)).toBe('00:01:01');
      expect(formatTime(3661)).toBe('01:01:01');
    });
  });

  describe('formatTimeRemaining', () => {
    it('should format time in friendly format', () => {
      expect(formatTimeRemaining(3665)).toBe('1 hour 1 minute');
      expect(formatTimeRemaining(3600)).toBe('1 hour');
      expect(formatTimeRemaining(1800)).toBe('30 minutes');
      expect(formatTimeRemaining(60)).toBe('1 minute');
      expect(formatTimeRemaining(30)).toBe('30 seconds');
    });

    it('should handle 0 seconds', () => {
      expect(formatTimeRemaining(0)).toBe('0 seconds');
    });

    it('should pluralize correctly', () => {
      expect(formatTimeRemaining(7200)).toBe('2 hours');
      expect(formatTimeRemaining(120)).toBe('2 minutes');
      expect(formatTimeRemaining(2)).toBe('2 seconds');
    });

    it('should show hours and minutes together', () => {
      expect(formatTimeRemaining(5400)).toBe('1 hour 30 minutes');
      expect(formatTimeRemaining(7380)).toBe('2 hours 3 minutes');
    });

    it('should prioritize hours over seconds', () => {
      expect(formatTimeRemaining(3665)).toBe('1 hour 1 minute');
    });
  });

  describe('isTimeLow', () => {
    it('should return true when time is below threshold', () => {
      expect(isTimeLow(250, 300)).toBe(true);
      expect(isTimeLow(100, 300)).toBe(true);
      expect(isTimeLow(0, 300)).toBe(true);
    });

    it('should return false when time is above threshold', () => {
      expect(isTimeLow(350, 300)).toBe(false);
      expect(isTimeLow(600, 300)).toBe(false);
    });

    it('should handle edge case at threshold', () => {
      expect(isTimeLow(300, 300)).toBe(false);
    });

    it('should use default threshold of 300 seconds', () => {
      expect(isTimeLow(250)).toBe(true);
      expect(isTimeLow(350)).toBe(false);
    });

    it('should handle null remaining time', () => {
      expect(isTimeLow(null)).toBe(false);
    });
  });

  describe('isTimeExpired', () => {
    it('should return true when time is 0 or less', () => {
      expect(isTimeExpired(0)).toBe(true);
      expect(isTimeExpired(-1)).toBe(true);
      expect(isTimeExpired(-100)).toBe(true);
    });

    it('should return false when time is positive', () => {
      expect(isTimeExpired(1)).toBe(false);
      expect(isTimeExpired(100)).toBe(false);
      expect(isTimeExpired(1800)).toBe(false);
    });

    it('should handle null remaining time', () => {
      expect(isTimeExpired(null)).toBe(false);
    });
  });

  describe('calculateTimeSpent', () => {
    it('should calculate time difference in seconds', () => {
      const startedAt = '2026-01-09T09:00:00.000Z';
      const now = '2026-01-09T09:25:00.000Z';

      const timeSpent = calculateTimeSpent(startedAt, now);
      expect(timeSpent).toBe(1500); // 25 minutes
    });

    it('should use current time if endTime not provided', () => {
      const startedAt = new Date(Date.now() - 60000).toISOString(); // 1 minute ago

      const timeSpent = calculateTimeSpent(startedAt);
      expect(timeSpent).toBeGreaterThanOrEqual(59);
      expect(timeSpent).toBeLessThanOrEqual(61);
    });

    it('should handle same start and end time', () => {
      const time = '2026-01-09T09:00:00.000Z';

      const timeSpent = calculateTimeSpent(time, time);
      expect(timeSpent).toBe(0);
    });

    it('should handle large time differences', () => {
      const startedAt = '2026-01-09T09:00:00.000Z';
      const endTime = '2026-01-09T11:00:00.000Z'; // 2 hours later

      const timeSpent = calculateTimeSpent(startedAt, endTime);
      expect(timeSpent).toBe(7200);
    });
  });

  describe('calculateRemainingTime', () => {
    it('should calculate remaining time correctly', () => {
      const timeLimit = 1800; // 30 minutes
      const timeSpent = 600; // 10 minutes

      const remaining = calculateRemainingTime(timeLimit, timeSpent);
      expect(remaining).toBe(1200); // 20 minutes
    });

    it('should return 0 when time is exceeded', () => {
      const timeLimit = 1800;
      const timeSpent = 2000;

      const remaining = calculateRemainingTime(timeLimit, timeSpent);
      expect(remaining).toBe(0);
    });

    it('should handle unlimited time (0)', () => {
      const timeLimit = 0;
      const timeSpent = 1000;

      const remaining = calculateRemainingTime(timeLimit, timeSpent);
      expect(remaining).toBeNull();
    });

    it('should handle no time spent', () => {
      const timeLimit = 1800;
      const timeSpent = 0;

      const remaining = calculateRemainingTime(timeLimit, timeSpent);
      expect(remaining).toBe(1800);
    });

    it('should handle exact time limit', () => {
      const timeLimit = 1800;
      const timeSpent = 1800;

      const remaining = calculateRemainingTime(timeLimit, timeSpent);
      expect(remaining).toBe(0);
    });
  });
});
