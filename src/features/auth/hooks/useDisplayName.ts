/**
 * useDisplayName Hook - Phase 2
 * Version: 2.0.0
 * Date: 2026-01-13
 *
 * Get formatted display name for current user
 * Uses getDisplayName() helper from person-helpers
 * Handles loading/null states
 */

import { useMemo } from 'react';
import { useAuthStore } from '../model/authStore';
import { getDisplayName } from '@/shared/lib/person-helpers';

/**
 * Get formatted display name for authenticated user
 *
 * Priority:
 * 1. Person data (preferred name if set, otherwise legal name)
 * 2. Deprecated firstName/lastName fields (backward compatibility)
 * 3. Empty string if no name data available
 *
 * @returns Formatted display name string
 *
 * @example
 * ```tsx
 * function WelcomeMessage() {
 *   const displayName = useDisplayName();
 *
 *   return <h1>Welcome, {displayName || 'User'}!</h1>;
 * }
 * ```
 */
export function useDisplayName(): string {
  const user = useAuthStore((state) => state.user);

  return useMemo(() => {
    if (!user) {
      return '';
    }

    // Prefer person data (v2.0)
    if (user.person) {
      return getDisplayName(user.person);
    }

    // Fallback to deprecated fields (v1.0 backward compatibility)
    if (user.firstName || user.lastName) {
      const firstName = user.firstName?.trim() || '';
      const lastName = user.lastName?.trim() || '';
      return `${firstName} ${lastName}`.trim();
    }

    return '';
  }, [user]);
}
