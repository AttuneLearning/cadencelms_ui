/**
 * Timer Utilities
 * Functions for time formatting and calculations
 */

/**
 * Format seconds to HH:MM:SS format
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [hours, minutes, secs]
    .map((val) => val.toString().padStart(2, '0'))
    .join(':');
}

/**
 * Format time remaining in a friendly format
 * e.g., "1 hour 30 minutes" or "5 minutes" or "30 seconds"
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return '0 seconds';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  }

  if (minutes > 0) {
    parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
  }

  if (hours === 0 && minutes === 0 && secs > 0) {
    parts.push(`${secs} second${secs > 1 ? 's' : ''}`);
  }

  return parts.join(' ') || '0 seconds';
}

/**
 * Check if time remaining is low (below threshold)
 * @param remainingTime Time remaining in seconds
 * @param threshold Threshold in seconds (default: 5 minutes)
 */
export function isTimeLow(
  remainingTime: number | null,
  threshold: number = 300
): boolean {
  if (remainingTime === null) return false;
  return remainingTime < threshold;
}

/**
 * Check if time has expired
 */
export function isTimeExpired(remainingTime: number | null): boolean {
  if (remainingTime === null) return false;
  return remainingTime <= 0;
}

/**
 * Calculate time spent from start time to end time (or now)
 * @param startedAt ISO date string
 * @param endTime ISO date string (optional, defaults to now)
 * @returns Time spent in seconds
 */
export function calculateTimeSpent(
  startedAt: string,
  endTime?: string
): number {
  const start = new Date(startedAt).getTime();
  const end = endTime ? new Date(endTime).getTime() : Date.now();

  return Math.floor((end - start) / 1000);
}

/**
 * Calculate remaining time from time limit and time spent
 * @param timeLimit Total time limit in seconds (0 = unlimited)
 * @param timeSpent Time already spent in seconds
 * @returns Remaining time in seconds (null if unlimited)
 */
export function calculateRemainingTime(
  timeLimit: number,
  timeSpent: number
): number | null {
  if (timeLimit === 0) return null; // Unlimited time

  const remaining = timeLimit - timeSpent;
  return Math.max(0, remaining); // Never return negative
}

/**
 * Parse duration string to seconds
 * e.g., "30m" -> 1800, "1h 30m" -> 5400
 */
export function parseDurationToSeconds(duration: string): number {
  const hours = duration.match(/(\d+)h/);
  const minutes = duration.match(/(\d+)m/);
  const seconds = duration.match(/(\d+)s/);

  let totalSeconds = 0;

  if (hours) totalSeconds += parseInt(hours[1]) * 3600;
  if (minutes) totalSeconds += parseInt(minutes[1]) * 60;
  if (seconds) totalSeconds += parseInt(seconds[1]);

  return totalSeconds;
}
