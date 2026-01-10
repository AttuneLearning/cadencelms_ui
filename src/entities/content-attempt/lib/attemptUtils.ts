/**
 * Attempt Utility Functions
 * Helper functions for content attempt status and calculations
 */

import type { AttemptStatus } from '../model/types';

/**
 * Get color code for attempt status
 */
export function getAttemptStatusColor(status: AttemptStatus): string {
  const colorMap: Record<AttemptStatus, string> = {
    'not-started': 'gray',
    started: 'blue',
    'in-progress': 'blue',
    completed: 'green',
    passed: 'green',
    failed: 'red',
    suspended: 'yellow',
    abandoned: 'gray',
  };

  return colorMap[status];
}

/**
 * Get human-readable label for attempt status
 */
export function getAttemptStatusLabel(status: AttemptStatus): string {
  const labelMap: Record<AttemptStatus, string> = {
    'not-started': 'Not Started',
    started: 'Started',
    'in-progress': 'In Progress',
    completed: 'Completed',
    passed: 'Passed',
    failed: 'Failed',
    suspended: 'Suspended',
    abandoned: 'Abandoned',
  };

  return labelMap[status];
}

/**
 * Check if attempt is in progress
 */
export function isAttemptInProgress(status: AttemptStatus): boolean {
  return status === 'started' || status === 'in-progress';
}

/**
 * Check if attempt is complete
 */
export function isAttemptComplete(status: AttemptStatus): boolean {
  return status === 'completed' || status === 'passed' || status === 'failed';
}

/**
 * Check if attempt can be resumed
 */
export function canResumeAttempt(status: AttemptStatus): boolean {
  return status === 'suspended';
}

/**
 * Check if attempt can be completed
 */
export function canCompleteAttempt(status: AttemptStatus): boolean {
  return isAttemptInProgress(status);
}

/**
 * Calculate progress percentage from status
 */
export function calculateProgressFromStatus(
  status: AttemptStatus,
  explicitProgress: number | null
): number {
  if (explicitProgress !== null) return explicitProgress;

  if (status === 'not-started') return 0;
  if (isAttemptComplete(status)) return 100;

  return 0;
}

/**
 * Calculate attempt duration in seconds
 */
export function getAttemptDuration(
  startedAt: string | null,
  completedAt: string | null
): number {
  if (!startedAt) return 0;

  try {
    const start = new Date(startedAt);
    const end = completedAt ? new Date(completedAt) : new Date();

    if (isNaN(start.getTime())) return 0;

    return Math.floor((end.getTime() - start.getTime()) / 1000);
  } catch {
    return 0;
  }
}

/**
 * Format duration in seconds to human-readable string
 */
export function formatAttemptDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }

  if (minutes === 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }

  return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
}

/**
 * Check if auto-save should be triggered
 */
export function shouldAutoSave(
  lastSaveTimestamp: number | null,
  intervalMs = 30000
): boolean {
  if (!lastSaveTimestamp || lastSaveTimestamp === 0) return true;

  const now = Date.now();
  const elapsed = now - lastSaveTimestamp;

  return elapsed >= intervalMs;
}
