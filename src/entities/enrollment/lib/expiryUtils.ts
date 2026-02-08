/**
 * Expiry Utilities
 * Functions for handling enrollment expiration dates and status
 */

export type ExpiryStatus = 'active' | 'expiring_soon' | 'expired' | 'no_expiry';

export interface ExpiryInfo {
  status: ExpiryStatus;
  daysRemaining: number | null;
  label: string;
}

/**
 * Calculate the number of days between two dates
 * Positive means future, negative means past
 */
function daysBetween(fromDate: Date, toDate: Date): number {
  const diffMs = toDate.getTime() - fromDate.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Format the expiry label based on days remaining
 */
function formatExpiryLabel(daysRemaining: number): string {
  if (daysRemaining < 0) {
    const daysAgo = Math.abs(daysRemaining);
    if (daysAgo === 1) return 'Expired yesterday';
    if (daysAgo <= 7) return `Expired ${daysAgo} days ago`;
    if (daysAgo <= 30) {
      const weeksAgo = Math.floor(daysAgo / 7);
      return `Expired ${weeksAgo} ${weeksAgo === 1 ? 'week' : 'weeks'} ago`;
    }
    const monthsAgo = Math.floor(daysAgo / 30);
    return `Expired ${monthsAgo} ${monthsAgo === 1 ? 'month' : 'months'} ago`;
  }

  if (daysRemaining === 0) return 'Expires today';
  if (daysRemaining === 1) return 'Expires tomorrow';
  if (daysRemaining <= 7) return `Expires in ${daysRemaining} days`;
  if (daysRemaining <= 30) {
    const weeks = Math.floor(daysRemaining / 7);
    return `Expires in ${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
  }
  const months = Math.floor(daysRemaining / 30);
  return `Expires in ${months} ${months === 1 ? 'month' : 'months'}`;
}

/**
 * Get expiry status and information for an enrollment
 *
 * @param expiresAt - ISO date string or null
 * @param now - Current date (defaults to now, can be overridden for testing)
 * @returns ExpiryInfo object with status, days remaining, and formatted label
 *
 * @example
 * const info = getExpiryStatus('2026-03-15T00:00:00Z');
 * if (info.status === 'expiring_soon') {
 *   console.log(info.label); // "Expires in 5 days"
 * }
 */
export function getExpiryStatus(
  expiresAt: string | null | undefined,
  now: Date = new Date()
): ExpiryInfo {
  // No expiry date set
  if (!expiresAt) {
    return {
      status: 'no_expiry',
      daysRemaining: null,
      label: 'No expiry',
    };
  }

  try {
    const expiryDate = new Date(expiresAt);

    // Invalid date
    if (isNaN(expiryDate.getTime())) {
      return {
        status: 'no_expiry',
        daysRemaining: null,
        label: 'No expiry',
      };
    }

    const daysRemaining = daysBetween(now, expiryDate);

    // Already expired
    if (daysRemaining < 0) {
      return {
        status: 'expired',
        daysRemaining,
        label: formatExpiryLabel(daysRemaining),
      };
    }

    // Expiring soon (within 30 days)
    if (daysRemaining <= 30) {
      return {
        status: 'expiring_soon',
        daysRemaining,
        label: formatExpiryLabel(daysRemaining),
      };
    }

    // Active with expiry date
    return {
      status: 'active',
      daysRemaining,
      label: formatExpiryLabel(daysRemaining),
    };
  } catch (error) {
    // Error parsing date
    return {
      status: 'no_expiry',
      daysRemaining: null,
      label: 'No expiry',
    };
  }
}

/**
 * Check if an enrollment is expiring soon (within threshold days)
 *
 * @param expiresAt - ISO date string or null
 * @param thresholdDays - Number of days to consider "soon" (default: 30)
 * @returns true if expiring within threshold
 */
export function isExpiringSoon(
  expiresAt: string | null | undefined,
  thresholdDays: number = 30
): boolean {
  if (!expiresAt) return false;

  const info = getExpiryStatus(expiresAt);
  return (
    info.status === 'expiring_soon' &&
    info.daysRemaining !== null &&
    info.daysRemaining <= thresholdDays &&
    info.daysRemaining >= 0
  );
}

/**
 * Check if an enrollment has expired
 *
 * @param expiresAt - ISO date string or null
 * @returns true if expired
 */
export function isExpired(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return false;

  const info = getExpiryStatus(expiresAt);
  return info.status === 'expired';
}

/**
 * Sort enrollments by expiry date (soonest first)
 * Enrollments with no expiry date are placed last
 *
 * @param enrollments - Array of objects with expiresAt property
 * @returns Sorted array
 */
export function sortByExpiry<T extends { expiresAt?: string | null }>(
  enrollments: T[]
): T[] {
  return [...enrollments].sort((a, b) => {
    // No expiry dates go last
    if (!a.expiresAt && !b.expiresAt) return 0;
    if (!a.expiresAt) return 1;
    if (!b.expiresAt) return -1;

    // Compare expiry dates (earliest first)
    const dateA = new Date(a.expiresAt).getTime();
    const dateB = new Date(b.expiresAt).getTime();
    return dateA - dateB;
  });
}
