/**
 * EventLogger Service
 * Manages batching, queuing, and retry logic for learning events
 *
 * Features:
 * - Event batching (don't send one event at a time)
 * - Automatic flush on batch size or interval
 * - Retry failed events with exponential backoff
 * - Queue events if offline
 * - Flush before page unload
 * - Performance optimized (non-blocking)
 */

import { learningEventApi } from '../api/learningEventApi';
import type { CreateLearningEventData } from '../model/types';

/**
 * Logger configuration options
 */
export interface EventLoggerOptions {
  /** Maximum events before auto-flush (default: 25) */
  batchSize?: number;
  /** Milliseconds between periodic flushes (default: 30000 = 30s) */
  flushInterval?: number;
  /** Maximum retry attempts for failed batches (default: 3) */
  maxRetries?: number;
  /** Initial retry delay in milliseconds (default: 1000) */
  retryDelay?: number;
  /** Enable debug logging (default: false) */
  debug?: boolean;
}

/**
 * Event logging options
 */
export interface LogEventOptions {
  /** Priority hint (not used yet, for future enhancement) */
  priority?: 'high' | 'normal' | 'low';
}

/**
 * Queued event with metadata
 */
interface QueuedEvent {
  event: CreateLearningEventData;
  retries: number;
  timestamp: number;
}

/**
 * Default configuration
 */
const DEFAULT_OPTIONS: Required<EventLoggerOptions> = {
  batchSize: 25,
  flushInterval: 30000, // 30 seconds
  maxRetries: 3,
  retryDelay: 1000,
  debug: false,
};

/**
 * EventLogger class
 * Manages event queuing, batching, and sending
 */
export class EventLogger {
  private options: Required<EventLoggerOptions>;
  private queue: QueuedEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private isDestroyed = false;
  private isFlushing = false;
  private retryQueue: QueuedEvent[] = [];
  private retryTimer: NodeJS.Timeout | null = null;

  constructor(options: EventLoggerOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.setupPeriodicFlush();
    this.setupBeforeUnload();

    if (this.options.debug) {
      console.log('[EventLogger] Initialized with options:', this.options);
    }
  }

  /**
   * Log a learning event
   * Non-blocking - adds to queue and returns immediately
   */
  logEvent(event: CreateLearningEventData, options?: LogEventOptions): void {
    if (this.isDestroyed) {
      console.warn('[EventLogger] Cannot log event - logger is destroyed');
      return;
    }

    const queuedEvent: QueuedEvent = {
      event,
      retries: 0,
      timestamp: Date.now(),
    };

    this.queue.push(queuedEvent);

    if (this.options.debug) {
      console.log('[EventLogger] Event queued:', event.type, 'Queue size:', this.queue.length);
    }

    // Auto-flush if batch size reached
    if (this.queue.length >= this.options.batchSize) {
      this.flush().catch(err => {
        console.error('[EventLogger] Auto-flush error:', err);
      });
    }
  }

  /**
   * Manually flush all queued events
   * Returns promise that resolves when flush completes
   */
  async flush(): Promise<void> {
    if (this.isDestroyed || this.isFlushing || this.queue.length === 0) {
      return;
    }

    this.isFlushing = true;
    const eventsToSend = [...this.queue];
    this.queue = [];

    try {
      if (this.options.debug) {
        console.log('[EventLogger] Flushing', eventsToSend.length, 'events');
      }

      const events = eventsToSend.map(qe => qe.event);
      const response = await learningEventApi.createBatch(events);

      if (this.options.debug) {
        console.log(
          '[EventLogger] Flush complete:',
          response.created,
          'created,',
          response.failed,
          'failed'
        );
      }

      // Handle partial failures
      if (response.failed > 0 && response.errors.length > 0) {
        this.handlePartialFailure(eventsToSend, response.errors);
      }
    } catch (error) {
      console.error('[EventLogger] Flush failed:', error);
      // Re-queue events for retry
      this.handleFlushError(eventsToSend);
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Get current queue size
   */
  getQueueSize(): number {
    return this.queue.length + this.retryQueue.length;
  }

  /**
   * Destroy the logger
   * Flushes remaining events and cleans up resources
   */
  async destroy(): Promise<void> {
    if (this.isDestroyed) {
      return;
    }

    if (this.options.debug) {
      console.log('[EventLogger] Destroying logger');
    }

    // Clear timers first
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }

    // Flush remaining events BEFORE setting destroyed flag
    await this.flush();

    // Now mark as destroyed
    this.isDestroyed = true;

    // Remove event listeners
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.handleBeforeUnload);
    }
  }

  /**
   * Setup periodic flush timer
   */
  private setupPeriodicFlush(): void {
    this.flushTimer = setInterval(() => {
      if (this.queue.length > 0) {
        this.flush().catch(err => {
          console.error('[EventLogger] Periodic flush error:', err);
        });
      }
    }, this.options.flushInterval);
  }

  /**
   * Setup beforeunload handler to flush before page closes
   */
  private setupBeforeUnload(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.handleBeforeUnload);
    }
  }

  /**
   * Handle beforeunload event
   */
  private handleBeforeUnload = (event: BeforeUnloadEvent): void => {
    if (this.queue.length > 0) {
      // Try to flush synchronously
      // Note: Modern browsers have restrictions on async operations in beforeunload
      this.flush().catch(err => {
        console.error('[EventLogger] Beforeunload flush error:', err);
      });
    }
  };

  /**
   * Handle flush errors by re-queuing events
   */
  private handleFlushError(failedEvents: QueuedEvent[]): void {
    for (const queuedEvent of failedEvents) {
      if (queuedEvent.retries < this.options.maxRetries) {
        queuedEvent.retries += 1;
        this.retryQueue.push(queuedEvent);

        if (this.options.debug) {
          console.log(
            '[EventLogger] Re-queuing event for retry',
            queuedEvent.retries,
            '/',
            this.options.maxRetries
          );
        }
      } else {
        console.error('[EventLogger] Max retries reached for event:', queuedEvent.event.type);
      }
    }

    this.scheduleRetry();
  }

  /**
   * Handle partial batch failures
   */
  private handlePartialFailure(
    sentEvents: QueuedEvent[],
    errors: Array<{ index: number; error: string }>
  ): void {
    for (const error of errors) {
      const failedEvent = sentEvents[error.index];
      if (failedEvent && failedEvent.retries < this.options.maxRetries) {
        failedEvent.retries += 1;
        this.retryQueue.push(failedEvent);

        if (this.options.debug) {
          console.log('[EventLogger] Re-queuing failed event:', error.error);
        }
      }
    }

    this.scheduleRetry();
  }

  /**
   * Schedule retry attempt with exponential backoff
   */
  private scheduleRetry(): void {
    if (this.retryTimer || this.retryQueue.length === 0) {
      return;
    }

    const delay = this.options.retryDelay * Math.pow(2, this.retryQueue[0].retries - 1);

    if (this.options.debug) {
      console.log('[EventLogger] Scheduling retry in', delay, 'ms');
    }

    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      this.processRetryQueue();
    }, delay);
  }

  /**
   * Process retry queue
   */
  private async processRetryQueue(): Promise<void> {
    if (this.retryQueue.length === 0) {
      return;
    }

    const eventsToRetry = [...this.retryQueue];
    this.retryQueue = [];

    // Move back to main queue
    this.queue.push(...eventsToRetry);

    // Try flushing again
    await this.flush();
  }
}

/**
 * Singleton instance for global usage
 */
let globalLogger: EventLogger | null = null;

/**
 * Get or create global event logger instance
 */
export function getEventLogger(options?: EventLoggerOptions): EventLogger {
  if (!globalLogger) {
    globalLogger = new EventLogger(options);
  }
  return globalLogger;
}

/**
 * Destroy global logger instance
 */
export async function destroyGlobalLogger(): Promise<void> {
  if (globalLogger) {
    await globalLogger.destroy();
    globalLogger = null;
  }
}

/**
 * Convenience function to log an event using global logger
 */
export function logLearningEvent(
  event: CreateLearningEventData,
  options?: LogEventOptions
): void {
  const logger = getEventLogger();
  logger.logEvent(event, options);
}
