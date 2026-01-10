/**
 * Tests for Video Utility Functions
 */

import { describe, it, expect } from 'vitest';
import {
  calculateWatchPercentage,
  formatVideoTime,
  parseVideoTime,
  isVideoCompleted,
  getVideoProgress,
  shouldMarkAsComplete,
} from '../videoUtils';

describe('videoUtils', () => {
  describe('calculateWatchPercentage', () => {
    it('should calculate watch percentage correctly', () => {
      expect(calculateWatchPercentage(0, 100)).toBe(0);
      expect(calculateWatchPercentage(50, 100)).toBe(50);
      expect(calculateWatchPercentage(100, 100)).toBe(100);
      expect(calculateWatchPercentage(75, 100)).toBe(75);
    });

    it('should handle edge cases', () => {
      expect(calculateWatchPercentage(0, 0)).toBe(0);
      expect(calculateWatchPercentage(100, 0)).toBe(0);
      expect(calculateWatchPercentage(-10, 100)).toBe(0);
      expect(calculateWatchPercentage(110, 100)).toBe(100);
    });

    it('should round to 2 decimal places', () => {
      expect(calculateWatchPercentage(33.333, 100)).toBe(33.33);
      expect(calculateWatchPercentage(66.666, 100)).toBe(66.67);
    });
  });

  describe('formatVideoTime', () => {
    it('should format seconds to MM:SS for short videos', () => {
      expect(formatVideoTime(0)).toBe('0:00');
      expect(formatVideoTime(30)).toBe('0:30');
      expect(formatVideoTime(65)).toBe('1:05');
      expect(formatVideoTime(599)).toBe('9:59');
    });

    it('should format seconds to HH:MM:SS for longer videos', () => {
      expect(formatVideoTime(3600)).toBe('1:00:00');
      expect(formatVideoTime(3661)).toBe('1:01:01');
      expect(formatVideoTime(7200)).toBe('2:00:00');
    });

    it('should handle edge cases', () => {
      expect(formatVideoTime(-10)).toBe('0:00');
      expect(formatVideoTime(0)).toBe('0:00');
    });
  });

  describe('parseVideoTime', () => {
    it('should parse MM:SS format', () => {
      expect(parseVideoTime('0:00')).toBe(0);
      expect(parseVideoTime('0:30')).toBe(30);
      expect(parseVideoTime('1:05')).toBe(65);
      expect(parseVideoTime('9:59')).toBe(599);
    });

    it('should parse HH:MM:SS format', () => {
      expect(parseVideoTime('1:00:00')).toBe(3600);
      expect(parseVideoTime('1:01:01')).toBe(3661);
      expect(parseVideoTime('2:00:00')).toBe(7200);
    });

    it('should handle invalid formats', () => {
      expect(parseVideoTime('invalid')).toBe(0);
      expect(parseVideoTime('')).toBe(0);
      expect(parseVideoTime('1:2:3:4')).toBe(0);
    });
  });

  describe('isVideoCompleted', () => {
    it('should return true when video is fully watched', () => {
      expect(isVideoCompleted(100, 100)).toBe(true);
      expect(isVideoCompleted(99, 100)).toBe(true);
      expect(isVideoCompleted(95, 100)).toBe(true);
    });

    it('should return false when video is not fully watched', () => {
      expect(isVideoCompleted(94, 100)).toBe(false);
      expect(isVideoCompleted(50, 100)).toBe(false);
      expect(isVideoCompleted(0, 100)).toBe(false);
    });

    it('should use custom threshold', () => {
      expect(isVideoCompleted(90, 100, 90)).toBe(true);
      expect(isVideoCompleted(89, 100, 90)).toBe(false);
      expect(isVideoCompleted(80, 100, 80)).toBe(true);
    });
  });

  describe('getVideoProgress', () => {
    it('should return progress data with all fields', () => {
      const result = getVideoProgress(450, 1800);
      expect(result).toEqual({
        currentTime: 450,
        duration: 1800,
        watchPercentage: 25,
        lastPosition: 450,
        isCompleted: false,
      });
    });

    it('should mark as completed when threshold reached', () => {
      const result = getVideoProgress(1710, 1800);
      expect(result.isCompleted).toBe(true);
      expect(result.watchPercentage).toBe(95);
    });

    it('should handle edge cases', () => {
      const result = getVideoProgress(0, 0);
      expect(result).toEqual({
        currentTime: 0,
        duration: 0,
        watchPercentage: 0,
        lastPosition: 0,
        isCompleted: false,
      });
    });
  });

  describe('shouldMarkAsComplete', () => {
    it('should return true when percentage exceeds threshold', () => {
      expect(shouldMarkAsComplete(95)).toBe(true);
      expect(shouldMarkAsComplete(100)).toBe(true);
      expect(shouldMarkAsComplete(96)).toBe(true);
    });

    it('should return false when percentage below threshold', () => {
      expect(shouldMarkAsComplete(94)).toBe(false);
      expect(shouldMarkAsComplete(50)).toBe(false);
      expect(shouldMarkAsComplete(0)).toBe(false);
    });

    it('should use custom threshold', () => {
      expect(shouldMarkAsComplete(90, 90)).toBe(true);
      expect(shouldMarkAsComplete(89, 90)).toBe(false);
      expect(shouldMarkAsComplete(80, 80)).toBe(true);
    });
  });
});
