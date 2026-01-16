/**
 * Polling Utilities
 * Helper functions for managing job status polling
 */

import type { ReportJobState } from '@/entities/report-job';

/**
 * Check if a job state should be polled
 */
export function shouldPollJobState(state: ReportJobState): boolean {
  const activeStates: ReportJobState[] = [
    'pending',
    'queued',
    'processing',
    'rendering',
    'uploading',
  ];

  return activeStates.includes(state);
}

/**
 * Check if a job state is terminal (completed or failed)
 */
export function isTerminalJobState(state: ReportJobState): boolean {
  const terminalStates: ReportJobState[] = [
    'ready',
    'failed',
    'cancelled',
    'downloaded',
  ];

  return terminalStates.includes(state);
}

/**
 * Get polling interval based on job state
 * Returns interval in milliseconds
 */
export function getPollingInterval(state: ReportJobState): number {
  // Default: 2 seconds for active jobs
  const defaultInterval = 2000;

  // Adjust interval based on state
  switch (state) {
    case 'pending':
    case 'queued':
      return 3000; // 3 seconds - less urgent
    case 'processing':
    case 'rendering':
      return 2000; // 2 seconds - standard
    case 'uploading':
      return 1000; // 1 second - final stage, faster updates
    default:
      return defaultInterval;
  }
}

/**
 * Calculate exponential backoff for errors
 */
export function calculateBackoff(attemptNumber: number, baseInterval = 2000, maxInterval = 30000): number {
  const interval = baseInterval * Math.pow(2, attemptNumber);
  return Math.min(interval, maxInterval);
}

/**
 * Check if error is transient (should retry)
 */
export function isTransientError(error: any): boolean {
  if (!error) return false;

  // Network errors
  if (error.message?.includes('network') || error.message?.includes('timeout')) {
    return true;
  }

  // HTTP status codes that warrant retry
  const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
  if (error.status && retryableStatusCodes.includes(error.status)) {
    return true;
  }

  return false;
}
