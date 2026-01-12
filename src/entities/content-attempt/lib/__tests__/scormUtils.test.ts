/**
 * Tests for SCORM Utility Functions
 */

import { describe, it, expect } from 'vitest';
import {
  formatScormTime,
  parseScormTime,
  validateCmiField,
  isReadOnlyCmiField,
  formatScormScore,
  parseSuspendData,
  serializeSuspendData,
  getLessonStatusFromCmi,
  getScoreFromCmi,
} from '../scormUtils';

describe('scormUtils', () => {
  describe('formatScormTime', () => {
    it('should format seconds to SCORM 1.2 time format (HH:MM:SS)', () => {
      expect(formatScormTime(0, '1.2')).toBe('00:00:00');
      expect(formatScormTime(65, '1.2')).toBe('00:01:05');
      expect(formatScormTime(3661, '1.2')).toBe('01:01:01');
      expect(formatScormTime(7200, '1.2')).toBe('02:00:00');
    });

    it('should format seconds to SCORM 2004 time format (PT format)', () => {
      expect(formatScormTime(0, '2004')).toBe('PT0S');
      expect(formatScormTime(65, '2004')).toBe('PT1M5S');
      expect(formatScormTime(3661, '2004')).toBe('PT1H1M1S');
      expect(formatScormTime(7200, '2004')).toBe('PT2H');
    });

    it('should handle edge cases', () => {
      expect(formatScormTime(59, '1.2')).toBe('00:00:59');
      expect(formatScormTime(60, '1.2')).toBe('00:01:00');
      expect(formatScormTime(3600, '1.2')).toBe('01:00:00');
    });
  });

  describe('parseScormTime', () => {
    it('should parse SCORM 1.2 time format to seconds', () => {
      expect(parseScormTime('00:00:00', '1.2')).toBe(0);
      expect(parseScormTime('00:01:05', '1.2')).toBe(65);
      expect(parseScormTime('01:01:01', '1.2')).toBe(3661);
      expect(parseScormTime('02:00:00', '1.2')).toBe(7200);
    });

    it('should parse SCORM 2004 time format to seconds', () => {
      expect(parseScormTime('PT0S', '2004')).toBe(0);
      expect(parseScormTime('PT1M5S', '2004')).toBe(65);
      expect(parseScormTime('PT1H1M1S', '2004')).toBe(3661);
      expect(parseScormTime('PT2H', '2004')).toBe(7200);
    });

    it('should handle invalid time formats', () => {
      expect(parseScormTime('invalid', '1.2')).toBe(0);
      expect(parseScormTime('', '1.2')).toBe(0);
      expect(parseScormTime('invalid', '2004')).toBe(0);
    });
  });

  describe('validateCmiField', () => {
    it('should validate SCORM 1.2 field names', () => {
      expect(validateCmiField('cmi.core.lesson_status', '1.2')).toBe(true);
      expect(validateCmiField('cmi.core.score.raw', '1.2')).toBe(true);
      expect(validateCmiField('cmi.suspend_data', '1.2')).toBe(true);
      expect(validateCmiField('cmi.invalid_field', '1.2')).toBe(false);
    });

    it('should validate SCORM 2004 field names', () => {
      expect(validateCmiField('cmi.completion_status', '2004')).toBe(true);
      expect(validateCmiField('cmi.score.raw', '2004')).toBe(true);
      expect(validateCmiField('cmi.suspend_data', '2004')).toBe(true);
      expect(validateCmiField('cmi.core.lesson_status', '2004')).toBe(false);
    });
  });

  describe('isReadOnlyCmiField', () => {
    it('should identify read-only fields', () => {
      expect(isReadOnlyCmiField('cmi.core.student_id')).toBe(true);
      expect(isReadOnlyCmiField('cmi.core.student_name')).toBe(true);
      expect(isReadOnlyCmiField('cmi.learner_id')).toBe(true);
      expect(isReadOnlyCmiField('cmi.learner_name')).toBe(true);
    });

    it('should identify writable fields', () => {
      expect(isReadOnlyCmiField('cmi.core.lesson_status')).toBe(false);
      expect(isReadOnlyCmiField('cmi.core.score.raw')).toBe(false);
      expect(isReadOnlyCmiField('cmi.suspend_data')).toBe(false);
    });
  });

  describe('formatScormScore', () => {
    it('should format score to SCORM format', () => {
      expect(formatScormScore(85)).toBe('85');
      expect(formatScormScore(92.5)).toBe('92.5');
      expect(formatScormScore(100)).toBe('100');
    });

    it('should handle null and undefined', () => {
      expect(formatScormScore(null)).toBe('');
      expect(formatScormScore(undefined)).toBe('');
    });
  });

  describe('parseSuspendData', () => {
    it('should parse suspend data string to object', () => {
      const result = parseSuspendData('bookmark=page5;completed=false;score=85');
      expect(result).toEqual({
        bookmark: 'page5',
        completed: 'false',
        score: '85',
      });
    });

    it('should handle empty suspend data', () => {
      expect(parseSuspendData('')).toEqual({});
      expect(parseSuspendData(null)).toEqual({});
      expect(parseSuspendData(undefined)).toEqual({});
    });

    it('should handle single key-value pair', () => {
      const result = parseSuspendData('bookmark=page3');
      expect(result).toEqual({ bookmark: 'page3' });
    });
  });

  describe('serializeSuspendData', () => {
    it('should serialize object to suspend data string', () => {
      const result = serializeSuspendData({
        bookmark: 'page5',
        completed: 'false',
        score: '85',
      });
      expect(result).toBe('bookmark=page5;completed=false;score=85');
    });

    it('should handle empty object', () => {
      expect(serializeSuspendData({})).toBe('');
    });

    it('should handle single key-value pair', () => {
      const result = serializeSuspendData({ bookmark: 'page3' });
      expect(result).toBe('bookmark=page3');
    });

    it('should escape special characters', () => {
      const result = serializeSuspendData({
        data: 'value;with=special',
      });
      expect(result).toContain('data=');
    });
  });

  describe('getLessonStatusFromCmi', () => {
    it('should extract lesson status from SCORM 1.2 CMI data', () => {
      const cmiData = {
        'cmi.core.lesson_status': 'incomplete',
        'cmi.core.score.raw': '85',
      };
      expect(getLessonStatusFromCmi(cmiData, '1.2')).toBe('incomplete');
    });

    it('should extract completion status from SCORM 2004 CMI data', () => {
      const cmiData = {
        'cmi.completion_status': 'incomplete',
        'cmi.score.raw': '85',
      };
      expect(getLessonStatusFromCmi(cmiData, '2004')).toBe('incomplete');
    });

    it('should return default status if not found', () => {
      expect(getLessonStatusFromCmi({}, '1.2')).toBe('not attempted');
      expect(getLessonStatusFromCmi({}, '2004')).toBe('unknown');
    });
  });

  describe('getScoreFromCmi', () => {
    it('should extract score from SCORM 1.2 CMI data', () => {
      const cmiData = {
        'cmi.core.score.raw': '85',
        'cmi.core.score.min': '0',
        'cmi.core.score.max': '100',
      };
      const result = getScoreFromCmi(cmiData, '1.2');
      expect(result).toEqual({
        raw: 85,
        min: 0,
        max: 100,
        scaled: null,
      });
    });

    it('should extract score from SCORM 2004 CMI data', () => {
      const cmiData = {
        'cmi.score.raw': '85',
        'cmi.score.min': '0',
        'cmi.score.max': '100',
        'cmi.score.scaled': '0.85',
      };
      const result = getScoreFromCmi(cmiData, '2004');
      expect(result).toEqual({
        raw: 85,
        min: 0,
        max: 100,
        scaled: 0.85,
      });
    });

    it('should handle missing score data', () => {
      const result = getScoreFromCmi({}, '1.2');
      expect(result).toEqual({
        raw: null,
        min: null,
        max: null,
        scaled: null,
      });
    });
  });
});
