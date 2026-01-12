/**
 * SCORM API Wrapper Tests
 * Tests for SCORM 1.2 and 2004 API implementations
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ScormAPI, ScormVersion } from '../scormApi';

describe('ScormAPI', () => {
  let scormApi: ScormAPI;
  let mockOnCommit: ReturnType<typeof vi.fn>;
  let mockOnTerminate: ReturnType<typeof vi.fn>;
  let mockOnError: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnCommit = vi.fn();
    mockOnTerminate = vi.fn();
    mockOnError = vi.fn();
  });

  afterEach(() => {
    scormApi?.destroy();
    delete (window as any).API;
    delete (window as any).API_1484_11;
  });

  describe('SCORM 1.2', () => {
    beforeEach(() => {
      scormApi = new ScormAPI('1.2', {
        onCommit: mockOnCommit,
        onTerminate: mockOnTerminate,
        onError: mockOnError,
        debug: false,
      });
      scormApi.initialize();
    });

    it('should expose window.API object', () => {
      expect((window as any).API).toBeDefined();
      expect((window as any).API.LMSInitialize).toBeInstanceOf(Function);
      expect((window as any).API.LMSGetValue).toBeInstanceOf(Function);
      expect((window as any).API.LMSSetValue).toBeInstanceOf(Function);
      expect((window as any).API.LMSCommit).toBeInstanceOf(Function);
      expect((window as any).API.LMSFinish).toBeInstanceOf(Function);
    });

    it('should initialize successfully', () => {
      const result = (window as any).API.LMSInitialize('');
      expect(result).toBe('true');
      expect(scormApi.isInitialized()).toBe(true);
    });

    it('should set and get values', () => {
      (window as any).API.LMSInitialize('');
      const setResult = (window as any).API.LMSSetValue('cmi.core.lesson_status', 'incomplete');
      expect(setResult).toBe('true');

      const getValue = (window as any).API.LMSGetValue('cmi.core.lesson_status');
      expect(getValue).toBe('incomplete');
    });

    it('should set and get score', () => {
      (window as any).API.LMSInitialize('');
      (window as any).API.LMSSetValue('cmi.core.score.raw', '85');
      (window as any).API.LMSSetValue('cmi.core.score.min', '0');
      (window as any).API.LMSSetValue('cmi.core.score.max', '100');

      expect((window as any).API.LMSGetValue('cmi.core.score.raw')).toBe('85');
      expect((window as any).API.LMSGetValue('cmi.core.score.min')).toBe('0');
      expect((window as any).API.LMSGetValue('cmi.core.score.max')).toBe('100');
    });

    it('should handle suspend data', () => {
      (window as any).API.LMSInitialize('');
      const suspendData = 'page=5;score=10;attempts=3';
      (window as any).API.LMSSetValue('cmi.suspend_data', suspendData);

      const retrieved = (window as any).API.LMSGetValue('cmi.suspend_data');
      expect(retrieved).toBe(suspendData);
    });

    it('should track session time', () => {
      (window as any).API.LMSInitialize('');
      (window as any).API.LMSSetValue('cmi.core.session_time', '00:05:30');

      const sessionTime = (window as any).API.LMSGetValue('cmi.core.session_time');
      expect(sessionTime).toBe('00:05:30');
    });

    it('should call onCommit when LMSCommit is called', () => {
      (window as any).API.LMSInitialize('');
      (window as any).API.LMSSetValue('cmi.core.lesson_status', 'completed');
      (window as any).API.LMSCommit('');

      expect(mockOnCommit).toHaveBeenCalledWith(
        expect.objectContaining({
          'cmi.core.lesson_status': 'completed',
        })
      );
    });

    it('should call onTerminate when LMSFinish is called', () => {
      (window as any).API.LMSInitialize('');
      (window as any).API.LMSSetValue('cmi.core.lesson_status', 'completed');
      (window as any).API.LMSFinish('');

      expect(mockOnTerminate).toHaveBeenCalledWith(
        expect.objectContaining({
          'cmi.core.lesson_status': 'completed',
        })
      );
    });

    it('should prevent setting read-only fields', () => {
      (window as any).API.LMSInitialize('');
      const result = (window as any).API.LMSSetValue('cmi.core.student_id', 'new-id');
      expect(result).toBe('false');
      expect((window as any).API.LMSGetLastError()).not.toBe('0');
    });

    it('should return error for invalid field names', () => {
      (window as any).API.LMSInitialize('');
      const result = (window as any).API.LMSSetValue('invalid.field', 'value');
      expect(result).toBe('false');
      expect((window as any).API.LMSGetLastError()).not.toBe('0');
    });

    it('should restore data from savedData', () => {
      const savedData = {
        'cmi.core.lesson_status': 'incomplete',
        'cmi.core.score.raw': '75',
        'cmi.suspend_data': 'page=3',
      };

      scormApi = new ScormAPI('1.2', {
        savedData,
      });
      scormApi.initialize();

      (window as any).API.LMSInitialize('');
      expect((window as any).API.LMSGetValue('cmi.core.lesson_status')).toBe('incomplete');
      expect((window as any).API.LMSGetValue('cmi.core.score.raw')).toBe('75');
      expect((window as any).API.LMSGetValue('cmi.suspend_data')).toBe('page=3');
    });

    it('should get all CMI data', () => {
      (window as any).API.LMSInitialize('');
      (window as any).API.LMSSetValue('cmi.core.lesson_status', 'completed');
      (window as any).API.LMSSetValue('cmi.core.score.raw', '90');

      const allData = scormApi.getAllData();
      expect(allData).toMatchObject({
        'cmi.core.lesson_status': 'completed',
        'cmi.core.score.raw': '90',
      });
    });
  });

  describe('SCORM 2004', () => {
    beforeEach(() => {
      scormApi = new ScormAPI('2004', {
        onCommit: mockOnCommit,
        onTerminate: mockOnTerminate,
        onError: mockOnError,
        debug: false,
      });
      scormApi.initialize();
    });

    it('should expose window.API_1484_11 object', () => {
      expect((window as any).API_1484_11).toBeDefined();
      expect((window as any).API_1484_11.Initialize).toBeInstanceOf(Function);
      expect((window as any).API_1484_11.GetValue).toBeInstanceOf(Function);
      expect((window as any).API_1484_11.SetValue).toBeInstanceOf(Function);
      expect((window as any).API_1484_11.Commit).toBeInstanceOf(Function);
      expect((window as any).API_1484_11.Terminate).toBeInstanceOf(Function);
    });

    it('should initialize successfully', () => {
      const result = (window as any).API_1484_11.Initialize('');
      expect(result).toBe('true');
      expect(scormApi.isInitialized()).toBe(true);
    });

    it('should set and get values', () => {
      (window as any).API_1484_11.Initialize('');
      const setResult = (window as any).API_1484_11.SetValue('cmi.completion_status', 'incomplete');
      expect(setResult).toBe('true');

      const getValue = (window as any).API_1484_11.GetValue('cmi.completion_status');
      expect(getValue).toBe('incomplete');
    });

    it('should set and get score', () => {
      (window as any).API_1484_11.Initialize('');
      (window as any).API_1484_11.SetValue('cmi.score.raw', '85');
      (window as any).API_1484_11.SetValue('cmi.score.min', '0');
      (window as any).API_1484_11.SetValue('cmi.score.max', '100');
      (window as any).API_1484_11.SetValue('cmi.score.scaled', '0.85');

      expect((window as any).API_1484_11.GetValue('cmi.score.raw')).toBe('85');
      expect((window as any).API_1484_11.GetValue('cmi.score.scaled')).toBe('0.85');
    });

    it('should handle completion and success status', () => {
      (window as any).API_1484_11.Initialize('');
      (window as any).API_1484_11.SetValue('cmi.completion_status', 'completed');
      (window as any).API_1484_11.SetValue('cmi.success_status', 'passed');

      expect((window as any).API_1484_11.GetValue('cmi.completion_status')).toBe('completed');
      expect((window as any).API_1484_11.GetValue('cmi.success_status')).toBe('passed');
    });

    it('should call onCommit when Commit is called', () => {
      (window as any).API_1484_11.Initialize('');
      (window as any).API_1484_11.SetValue('cmi.completion_status', 'completed');
      (window as any).API_1484_11.Commit('');

      expect(mockOnCommit).toHaveBeenCalledWith(
        expect.objectContaining({
          'cmi.completion_status': 'completed',
        })
      );
    });

    it('should call onTerminate when Terminate is called', () => {
      (window as any).API_1484_11.Initialize('');
      (window as any).API_1484_11.SetValue('cmi.completion_status', 'completed');
      (window as any).API_1484_11.Terminate('');

      expect(mockOnTerminate).toHaveBeenCalledWith(
        expect.objectContaining({
          'cmi.completion_status': 'completed',
        })
      );
    });

    it('should prevent setting read-only fields', () => {
      (window as any).API_1484_11.Initialize('');
      const result = (window as any).API_1484_11.SetValue('cmi.learner_id', 'new-id');
      expect(result).toBe('false');
      expect((window as any).API_1484_11.GetLastError()).not.toBe('0');
    });
  });

  describe('Auto-save functionality', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should auto-save at specified interval', () => {
      scormApi = new ScormAPI('1.2', {
        onCommit: mockOnCommit,
        autoSaveInterval: 5000,
      });
      scormApi.initialize();

      (window as any).API.LMSInitialize('');
      (window as any).API.LMSSetValue('cmi.core.lesson_status', 'incomplete');

      // Fast-forward 5 seconds
      vi.advanceTimersByTime(5000);

      expect(mockOnCommit).toHaveBeenCalled();
    });

    it('should not auto-save if no changes', () => {
      scormApi = new ScormAPI('1.2', {
        onCommit: mockOnCommit,
        autoSaveInterval: 5000,
      });
      scormApi.initialize();

      (window as any).API.LMSInitialize('');

      // Fast-forward 5 seconds
      vi.advanceTimersByTime(5000);

      expect(mockOnCommit).not.toHaveBeenCalled();
    });

    it('should stop auto-save after terminate', () => {
      scormApi = new ScormAPI('1.2', {
        onCommit: mockOnCommit,
        onTerminate: mockOnTerminate,
        autoSaveInterval: 5000,
      });
      scormApi.initialize();

      (window as any).API.LMSInitialize('');
      (window as any).API.LMSSetValue('cmi.core.lesson_status', 'completed');
      (window as any).API.LMSFinish('');

      mockOnCommit.mockClear();

      // Fast-forward 10 seconds after terminate
      vi.advanceTimersByTime(10000);

      // Should not auto-save after terminate
      expect(mockOnCommit).not.toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      scormApi = new ScormAPI('1.2', {
        onError: mockOnError,
      });
      scormApi.initialize();
    });

    it('should call onError for invalid operations', () => {
      (window as any).API.LMSInitialize('');
      (window as any).API.LMSSetValue('invalid.field', 'value');

      expect(mockOnError).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: expect.any(String),
          errorMessage: expect.any(String),
        })
      );
    });

    it('should prevent operations before initialization', () => {
      const result = (window as any).API.LMSSetValue('cmi.core.lesson_status', 'incomplete');
      expect(result).toBe('false');
    });

    it('should prevent operations after termination', () => {
      (window as any).API.LMSInitialize('');
      (window as any).API.LMSFinish('');

      const result = (window as any).API.LMSSetValue('cmi.core.lesson_status', 'incomplete');
      expect(result).toBe('false');
    });
  });

  describe('Session tracking', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      scormApi = new ScormAPI('1.2', {
        onCommit: mockOnCommit,
      });
      scormApi.initialize();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should track session time', () => {
      (window as any).API.LMSInitialize('');

      // Fast-forward 5 minutes
      vi.advanceTimersByTime(5 * 60 * 1000);

      scormApi.updateSessionTime();
      const sessionTime = scormApi.getSessionTime();

      expect(sessionTime).toBe(300); // 5 minutes in seconds
    });

    it('should format session time correctly for SCORM 1.2', () => {
      (window as any).API.LMSInitialize('');

      // Fast-forward 1 hour, 5 minutes, 30 seconds
      vi.advanceTimersByTime((1 * 60 * 60 + 5 * 60 + 30) * 1000);

      scormApi.updateSessionTime();
      const formattedTime = (window as any).API.LMSGetValue('cmi.core.session_time');

      expect(formattedTime).toBe('01:05:30');
    });
  });
});
