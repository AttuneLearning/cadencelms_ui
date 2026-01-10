/**
 * Tests for Attempt Utility Functions
 */

import { describe, it, expect } from 'vitest';
import {
  getAttemptStatusColor,
  getAttemptStatusLabel,
  isAttemptInProgress,
  isAttemptComplete,
  canResumeAttempt,
  canCompleteAttempt,
  calculateProgressFromStatus,
  getAttemptDuration,
  formatAttemptDuration,
  shouldAutoSave,
} from '../attemptUtils';

describe('attemptUtils', () => {
  describe('getAttemptStatusColor', () => {
    it('should return correct color for each status', () => {
      expect(getAttemptStatusColor('not-started')).toBe('gray');
      expect(getAttemptStatusColor('started')).toBe('blue');
      expect(getAttemptStatusColor('in-progress')).toBe('blue');
      expect(getAttemptStatusColor('completed')).toBe('green');
      expect(getAttemptStatusColor('passed')).toBe('green');
      expect(getAttemptStatusColor('failed')).toBe('red');
      expect(getAttemptStatusColor('suspended')).toBe('yellow');
      expect(getAttemptStatusColor('abandoned')).toBe('gray');
    });
  });

  describe('getAttemptStatusLabel', () => {
    it('should return correct label for each status', () => {
      expect(getAttemptStatusLabel('not-started')).toBe('Not Started');
      expect(getAttemptStatusLabel('started')).toBe('Started');
      expect(getAttemptStatusLabel('in-progress')).toBe('In Progress');
      expect(getAttemptStatusLabel('completed')).toBe('Completed');
      expect(getAttemptStatusLabel('passed')).toBe('Passed');
      expect(getAttemptStatusLabel('failed')).toBe('Failed');
      expect(getAttemptStatusLabel('suspended')).toBe('Suspended');
      expect(getAttemptStatusLabel('abandoned')).toBe('Abandoned');
    });
  });

  describe('isAttemptInProgress', () => {
    it('should return true for in-progress statuses', () => {
      expect(isAttemptInProgress('started')).toBe(true);
      expect(isAttemptInProgress('in-progress')).toBe(true);
    });

    it('should return false for non-in-progress statuses', () => {
      expect(isAttemptInProgress('not-started')).toBe(false);
      expect(isAttemptInProgress('completed')).toBe(false);
      expect(isAttemptInProgress('passed')).toBe(false);
      expect(isAttemptInProgress('failed')).toBe(false);
      expect(isAttemptInProgress('suspended')).toBe(false);
      expect(isAttemptInProgress('abandoned')).toBe(false);
    });
  });

  describe('isAttemptComplete', () => {
    it('should return true for completed statuses', () => {
      expect(isAttemptComplete('completed')).toBe(true);
      expect(isAttemptComplete('passed')).toBe(true);
      expect(isAttemptComplete('failed')).toBe(true);
    });

    it('should return false for non-completed statuses', () => {
      expect(isAttemptComplete('not-started')).toBe(false);
      expect(isAttemptComplete('started')).toBe(false);
      expect(isAttemptComplete('in-progress')).toBe(false);
      expect(isAttemptComplete('suspended')).toBe(false);
      expect(isAttemptComplete('abandoned')).toBe(false);
    });
  });

  describe('canResumeAttempt', () => {
    it('should return true only for suspended attempts', () => {
      expect(canResumeAttempt('suspended')).toBe(true);
    });

    it('should return false for non-suspended attempts', () => {
      expect(canResumeAttempt('not-started')).toBe(false);
      expect(canResumeAttempt('started')).toBe(false);
      expect(canResumeAttempt('in-progress')).toBe(false);
      expect(canResumeAttempt('completed')).toBe(false);
      expect(canResumeAttempt('passed')).toBe(false);
      expect(canResumeAttempt('failed')).toBe(false);
      expect(canResumeAttempt('abandoned')).toBe(false);
    });
  });

  describe('canCompleteAttempt', () => {
    it('should return true for in-progress attempts', () => {
      expect(canCompleteAttempt('started')).toBe(true);
      expect(canCompleteAttempt('in-progress')).toBe(true);
    });

    it('should return false for non-in-progress attempts', () => {
      expect(canCompleteAttempt('not-started')).toBe(false);
      expect(canCompleteAttempt('completed')).toBe(false);
      expect(canCompleteAttempt('passed')).toBe(false);
      expect(canCompleteAttempt('failed')).toBe(false);
      expect(canCompleteAttempt('suspended')).toBe(false);
      expect(canCompleteAttempt('abandoned')).toBe(false);
    });
  });

  describe('calculateProgressFromStatus', () => {
    it('should return 0 for not-started', () => {
      expect(calculateProgressFromStatus('not-started', null)).toBe(0);
    });

    it('should return progress value if provided', () => {
      expect(calculateProgressFromStatus('in-progress', 65)).toBe(65);
      expect(calculateProgressFromStatus('started', 25)).toBe(25);
    });

    it('should return 100 for completed statuses', () => {
      expect(calculateProgressFromStatus('completed', null)).toBe(100);
      expect(calculateProgressFromStatus('passed', null)).toBe(100);
      expect(calculateProgressFromStatus('failed', null)).toBe(100);
    });

    it('should prefer explicit progress over status-based calculation', () => {
      expect(calculateProgressFromStatus('completed', 95)).toBe(95);
      expect(calculateProgressFromStatus('passed', 98)).toBe(98);
    });
  });

  describe('getAttemptDuration', () => {
    it('should calculate duration from start to end', () => {
      const startedAt = '2026-01-09T10:00:00.000Z';
      const completedAt = '2026-01-09T11:30:00.000Z';
      const duration = getAttemptDuration(startedAt, completedAt);
      expect(duration).toBe(5400); // 90 minutes in seconds
    });

    it('should calculate duration from start to now if not completed', () => {
      const startedAt = new Date(Date.now() - 1800000).toISOString(); // 30 minutes ago
      const duration = getAttemptDuration(startedAt, null);
      expect(duration).toBeGreaterThanOrEqual(1799);
      expect(duration).toBeLessThanOrEqual(1801);
    });

    it('should return 0 if start date is invalid', () => {
      expect(getAttemptDuration(null, null)).toBe(0);
      expect(getAttemptDuration('invalid', null)).toBe(0);
    });
  });

  describe('formatAttemptDuration', () => {
    it('should format duration in seconds', () => {
      expect(formatAttemptDuration(45)).toBe('45 seconds');
      expect(formatAttemptDuration(1)).toBe('1 second');
    });

    it('should format duration in minutes', () => {
      expect(formatAttemptDuration(120)).toBe('2 minutes');
      expect(formatAttemptDuration(60)).toBe('1 minute');
      expect(formatAttemptDuration(90)).toBe('1 minute');
      expect(formatAttemptDuration(150)).toBe('2 minutes');
    });

    it('should format duration in hours and minutes', () => {
      expect(formatAttemptDuration(3600)).toBe('1 hour');
      expect(formatAttemptDuration(3660)).toBe('1 hour 1 minute');
      expect(formatAttemptDuration(7200)).toBe('2 hours');
      expect(formatAttemptDuration(7320)).toBe('2 hours 2 minutes');
    });

    it('should handle zero duration', () => {
      expect(formatAttemptDuration(0)).toBe('0 seconds');
    });
  });

  describe('shouldAutoSave', () => {
    it('should return true when enough time has passed', () => {
      const lastSave = Date.now() - 31000; // 31 seconds ago
      expect(shouldAutoSave(lastSave, 30000)).toBe(true);
    });

    it('should return false when not enough time has passed', () => {
      const lastSave = Date.now() - 29000; // 29 seconds ago
      expect(shouldAutoSave(lastSave, 30000)).toBe(false);
    });

    it('should return true if never saved before', () => {
      expect(shouldAutoSave(null, 30000)).toBe(true);
      expect(shouldAutoSave(0, 30000)).toBe(true);
    });

    it('should use custom interval', () => {
      const lastSave = Date.now() - 61000; // 61 seconds ago
      expect(shouldAutoSave(lastSave, 60000)).toBe(true);
      expect(shouldAutoSave(Date.now() - 59000, 60000)).toBe(false);
    });
  });
});
