/**
 * usePersonData Hook - Phase 2
 * Version: 2.0.0
 * Date: 2026-01-13
 *
 * Extract person data from auth store
 * Returns IPerson or null
 * Memoized for performance
 */

import { useMemo } from 'react';
import { useAuthStore } from '../model/authStore';
import type { IPerson } from '@/shared/types/person';

/**
 * Get person data from authenticated user
 *
 * Returns the IPerson object from the current user if available.
 * Returns null if user is not authenticated or has no person data.
 *
 * @returns IPerson | null
 *
 * @example
 * ```tsx
 * function ProfileComponent() {
 *   const person = usePersonData();
 *
 *   if (!person) {
 *     return <div>No profile data available</div>;
 *   }
 *
 *   return (
 *     <div>
 *       <h1>{person.firstName} {person.lastName}</h1>
 *       <p>{getPrimaryEmail(person)?.email}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function usePersonData(): IPerson | null {
  const user = useAuthStore((state) => state.user);

  return useMemo(() => {
    if (!user || !user.person) {
      return null;
    }

    return user.person;
  }, [user]);
}
