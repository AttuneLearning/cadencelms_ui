/**
 * Tests for EventLogger Service
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventLogger } from '../eventLogger';
import type { CreateLearningEventData } from '../../model/types';

// Mock the API
const mockCreateBatch = vi.fn();
vi.mock('../../api/learningEventApi', () => ({
  learningEventApi: {
    createBatch: (...args: any[]) => mockCreateBatch(...args),
  },
}));

describe('EventLogger', () => {
  let logger: EventLogger;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateBatch.mockResolvedValue({
      created: 1,
      failed: 0,
      events: [],
      errors: [],
    });
  });

  afterEach(() => {
    if (logger) {
      logger.destroy();
    }
  });

  describe('constructor', () => {
    it('should create logger with default options', () => {
      logger = new EventLogger();
      expect(logger).toBeDefined();
    });

    it('should create logger with custom options', () => {
      logger = new EventLogger({
        batchSize: 50,
        flushInterval: 10000,
        maxRetries: 5,
      });
      expect(logger).toBeDefined();
    });
  });

  describe('logEvent', () => {
    beforeEach(() => {
      logger = new EventLogger({ batchSize: 3, flushInterval: 10000 });
    });

    it('should queue event without immediately sending', () => {
      const event: CreateLearningEventData = {
        type: 'content_completed',
        learnerId: 'learner-1',
        courseId: 'course-1',
        score: 95,
      };

      logger.logEvent(event);

      expect(mockCreateBatch).not.toHaveBeenCalled();
    });

    it('should auto-flush when batch size is reached', async () => {
      const events: CreateLearningEventData[] = [
        { type: 'content_started', learnerId: 'learner-1', courseId: 'course-1' },
        { type: 'content_completed', learnerId: 'learner-1', courseId: 'course-1' },
        { type: 'module_completed', learnerId: 'learner-1', courseId: 'course-1' },
      ];

      for (const event of events) {
        logger.logEvent(event);
      }

      // Wait for async flush
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockCreateBatch).toHaveBeenCalledWith(events);
    });

    it('should accept additional options', () => {
      const event: CreateLearningEventData = {
        type: 'login',
        learnerId: 'learner-1',
        metadata: { source: 'web' },
      };

      logger.logEvent(event, { priority: 'high' });

      expect(mockCreateBatch).not.toHaveBeenCalled();
    });
  });

  describe('flush', () => {
    beforeEach(() => {
      logger = new EventLogger({ batchSize: 100, flushInterval: 60000 });
    });

    it('should send all queued events', async () => {
      const events: CreateLearningEventData[] = [
        { type: 'content_started', learnerId: 'learner-1', courseId: 'course-1' },
        { type: 'content_completed', learnerId: 'learner-1', courseId: 'course-1' },
      ];

      events.forEach(e => logger.logEvent(e));

      await logger.flush();

      expect(mockCreateBatch).toHaveBeenCalledTimes(1);
      expect(mockCreateBatch).toHaveBeenCalledWith(events);
    });

    it('should not send if queue is empty', async () => {
      await logger.flush();

      expect(mockCreateBatch).not.toHaveBeenCalled();
    });

    it('should clear queue after successful flush', async () => {
      logger.logEvent({ type: 'login', learnerId: 'learner-1' });

      await logger.flush();

      expect(mockCreateBatch).toHaveBeenCalledTimes(1);

      await logger.flush();

      expect(mockCreateBatch).toHaveBeenCalledTimes(1); // Still only 1 call
    });

    it('should handle API errors and retry', async () => {
      mockCreateBatch.mockRejectedValueOnce(new Error('Network error'));
      mockCreateBatch.mockResolvedValueOnce({
        created: 1,
        failed: 0,
        events: [],
        errors: [],
      });

      logger.logEvent({ type: 'login', learnerId: 'learner-1' });

      await logger.flush();

      // Wait for retry
      await new Promise(resolve => setTimeout(resolve, 1500));

      expect(mockCreateBatch).toHaveBeenCalledTimes(2); // Initial call + 1 retry
    });

    it('should give up after max retries', async () => {
      logger = new EventLogger({ maxRetries: 2, retryDelay: 100 });
      mockCreateBatch.mockRejectedValue(new Error('Network error'));

      logger.logEvent({ type: 'login', learnerId: 'learner-1' });

      await logger.flush();

      // Wait for all retries
      await new Promise(resolve => setTimeout(resolve, 500));

      expect(mockCreateBatch).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });

  describe('getQueueSize', () => {
    beforeEach(() => {
      logger = new EventLogger({ batchSize: 100 });
    });

    it('should return 0 for empty queue', () => {
      expect(logger.getQueueSize()).toBe(0);
    });

    it('should return correct queue size', () => {
      logger.logEvent({ type: 'login', learnerId: 'learner-1' });
      logger.logEvent({ type: 'logout', learnerId: 'learner-1' });
      logger.logEvent({ type: 'content_started', learnerId: 'learner-1' });

      expect(logger.getQueueSize()).toBe(3);
    });

    it('should return 0 after flush', async () => {
      logger.logEvent({ type: 'login', learnerId: 'learner-1' });
      await logger.flush();

      expect(logger.getQueueSize()).toBe(0);
    });
  });

  describe('destroy', () => {
    it('should flush queue and clean up', async () => {
      logger = new EventLogger({ batchSize: 100, flushInterval: 1000 });
      logger.logEvent({ type: 'login', learnerId: 'learner-1' });

      await logger.destroy();

      expect(mockCreateBatch).toHaveBeenCalledTimes(1);
    });

    it('should stop periodic flush after destroy', async () => {
      logger = new EventLogger({ batchSize: 100, flushInterval: 100 });
      logger.logEvent({ type: 'login', learnerId: 'learner-1' });

      await logger.destroy();

      const callCount = mockCreateBatch.mock.calls.length;

      // Wait and verify no more calls
      await new Promise(resolve => setTimeout(resolve, 300));

      expect(mockCreateBatch).toHaveBeenCalledTimes(callCount);
    });
  });

  describe('periodic flush', () => {
    it('should automatically flush based on interval', async () => {
      logger = new EventLogger({ batchSize: 100, flushInterval: 200 });
      logger.logEvent({ type: 'login', learnerId: 'learner-1' });

      // Wait for first flush
      await new Promise(resolve => setTimeout(resolve, 250));

      expect(mockCreateBatch).toHaveBeenCalledTimes(1);
    });

    it('should continue flushing on interval', async () => {
      logger = new EventLogger({ batchSize: 100, flushInterval: 150 });

      logger.logEvent({ type: 'login', learnerId: 'learner-1' });
      await new Promise(resolve => setTimeout(resolve, 200));

      logger.logEvent({ type: 'logout', learnerId: 'learner-1' });
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(mockCreateBatch).toHaveBeenCalledTimes(2);
    });
  });

  describe('beforeunload handling', () => {
    it('should flush on beforeunload event', async () => {
      logger = new EventLogger({ batchSize: 100 });
      logger.logEvent({ type: 'logout', learnerId: 'learner-1' });

      // Simulate beforeunload
      const beforeUnloadEvent = new Event('beforeunload');
      window.dispatchEvent(beforeUnloadEvent);

      // Wait for flush
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockCreateBatch).toHaveBeenCalledTimes(1);
    });
  });

  describe('offline queue', () => {
    it('should queue events when offline', async () => {
      mockCreateBatch.mockRejectedValue(new Error('Network error'));

      logger = new EventLogger({ maxRetries: 1, retryDelay: 100 });
      logger.logEvent({ type: 'content_completed', learnerId: 'learner-1' });

      await logger.flush();

      // Event should remain in queue after failed flush
      expect(logger.getQueueSize()).toBeGreaterThan(0);
    });

    it('should send queued events when back online', async () => {
      // First fail, then succeed
      mockCreateBatch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          created: 1,
          failed: 0,
          events: [],
          errors: [],
        });

      logger = new EventLogger({ maxRetries: 1, retryDelay: 100 });
      logger.logEvent({ type: 'content_completed', learnerId: 'learner-1' });

      await logger.flush();

      // Wait for retry
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(mockCreateBatch).toHaveBeenCalledTimes(2);
      expect(logger.getQueueSize()).toBe(0);
    });
  });

  describe('performance', () => {
    it('should not block on logEvent', () => {
      logger = new EventLogger({ batchSize: 100 });

      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        logger.logEvent({ type: 'content_started', learnerId: `learner-${i}` });
      }
      const duration = performance.now() - start;

      // Should be very fast (< 10ms for 100 events)
      expect(duration).toBeLessThan(10);
    });

    it('should handle large batches efficiently', async () => {
      logger = new EventLogger({ batchSize: 1000 });

      for (let i = 0; i < 500; i++) {
        logger.logEvent({ type: 'content_started', learnerId: `learner-${i}` });
      }

      const start = performance.now();
      await logger.flush();
      const duration = performance.now() - start;

      // Flush should be reasonably fast
      expect(duration).toBeLessThan(1000);
    });
  });
});
