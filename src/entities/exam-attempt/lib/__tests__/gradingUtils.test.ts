/**
 * Tests for Grading Utilities
 */

import { describe, it, expect } from 'vitest';
import { calculateGradeLetter, getGradeColor, isPassingGrade } from '../gradingUtils';

describe('gradingUtils', () => {
  describe('calculateGradeLetter', () => {
    it('should return A for 90% and above', () => {
      expect(calculateGradeLetter(100)).toBe('A');
      expect(calculateGradeLetter(95)).toBe('A');
      expect(calculateGradeLetter(90)).toBe('A');
    });

    it('should return B for 80-89%', () => {
      expect(calculateGradeLetter(89)).toBe('B');
      expect(calculateGradeLetter(85)).toBe('B');
      expect(calculateGradeLetter(80)).toBe('B');
    });

    it('should return C for 70-79%', () => {
      expect(calculateGradeLetter(79)).toBe('C');
      expect(calculateGradeLetter(75)).toBe('C');
      expect(calculateGradeLetter(70)).toBe('C');
    });

    it('should return D for 60-69%', () => {
      expect(calculateGradeLetter(69)).toBe('D');
      expect(calculateGradeLetter(65)).toBe('D');
      expect(calculateGradeLetter(60)).toBe('D');
    });

    it('should return F for below 60%', () => {
      expect(calculateGradeLetter(59)).toBe('F');
      expect(calculateGradeLetter(50)).toBe('F');
      expect(calculateGradeLetter(0)).toBe('F');
    });

    it('should handle edge cases', () => {
      expect(calculateGradeLetter(89.9)).toBe('B');
      expect(calculateGradeLetter(79.9)).toBe('C');
      expect(calculateGradeLetter(69.9)).toBe('D');
      expect(calculateGradeLetter(59.9)).toBe('F');
    });
  });

  describe('getGradeColor', () => {
    it('should return success color for A', () => {
      expect(getGradeColor('A')).toBe('success');
    });

    it('should return info color for B', () => {
      expect(getGradeColor('B')).toBe('info');
    });

    it('should return warning color for C', () => {
      expect(getGradeColor('C')).toBe('warning');
    });

    it('should return orange color for D', () => {
      expect(getGradeColor('D')).toBe('orange');
    });

    it('should return error color for F', () => {
      expect(getGradeColor('F')).toBe('error');
    });

    it('should return default color for unknown grade', () => {
      expect(getGradeColor('X')).toBe('default');
      expect(getGradeColor('')).toBe('default');
    });

    it('should be case insensitive', () => {
      expect(getGradeColor('a')).toBe('success');
      expect(getGradeColor('b')).toBe('info');
      expect(getGradeColor('c')).toBe('warning');
    });
  });

  describe('isPassingGrade', () => {
    it('should return true for passing grades', () => {
      expect(isPassingGrade('A')).toBe(true);
      expect(isPassingGrade('B')).toBe(true);
      expect(isPassingGrade('C')).toBe(true);
      expect(isPassingGrade('D')).toBe(true);
    });

    it('should return false for failing grade', () => {
      expect(isPassingGrade('F')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(isPassingGrade('a')).toBe(true);
      expect(isPassingGrade('f')).toBe(false);
    });

    it('should handle unknown grades as failing', () => {
      expect(isPassingGrade('X')).toBe(false);
      expect(isPassingGrade('')).toBe(false);
    });
  });
});
