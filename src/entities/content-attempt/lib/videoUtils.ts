/**
 * Video Utility Functions
 * Helper functions for video progress tracking
 */

/**
 * Calculate watch percentage from current time and duration
 */
export function calculateWatchPercentage(currentTime: number, duration: number): number {
  if (duration === 0 || currentTime < 0) return 0;
  if (currentTime > duration) return 100;

  const percentage = (currentTime / duration) * 100;
  return Math.round(percentage * 100) / 100; // Round to 2 decimal places
}

/**
 * Format seconds to time string (MM:SS or HH:MM:SS)
 */
export function formatVideoTime(seconds: number): string {
  if (seconds < 0) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

/**
 * Parse time string to seconds
 */
export function parseVideoTime(timeString: string): number {
  if (!timeString) return 0;

  try {
    const parts = timeString.split(':');

    if (parts.length === 2) {
      // MM:SS format
      const minutes = parseInt(parts[0], 10);
      const seconds = parseInt(parts[1], 10);
      return minutes * 60 + seconds;
    } else if (parts.length === 3) {
      // HH:MM:SS format
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      const seconds = parseInt(parts[2], 10);
      return hours * 3600 + minutes * 60 + seconds;
    }

    return 0;
  } catch {
    return 0;
  }
}

/**
 * Check if video is considered completed based on watch percentage
 * Default threshold is 95% (allows for skipping credits, etc.)
 */
export function isVideoCompleted(
  currentTime: number,
  duration: number,
  threshold = 95
): boolean {
  const percentage = calculateWatchPercentage(currentTime, duration);
  return percentage >= threshold;
}

/**
 * Get video progress data
 */
export function getVideoProgress(
  currentTime: number,
  duration: number,
  completionThreshold = 95
): {
  currentTime: number;
  duration: number;
  watchPercentage: number;
  lastPosition: number;
  isCompleted: boolean;
} {
  const watchPercentage = calculateWatchPercentage(currentTime, duration);
  const isCompleted = watchPercentage >= completionThreshold;

  return {
    currentTime,
    duration,
    watchPercentage,
    lastPosition: currentTime,
    isCompleted,
  };
}

/**
 * Check if video should be marked as complete
 */
export function shouldMarkAsComplete(watchPercentage: number, threshold = 95): boolean {
  return watchPercentage >= threshold;
}
