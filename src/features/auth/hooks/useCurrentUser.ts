/**
 * useCurrentUser Hook - Phase 2 Enhanced
 * Version: 2.0.0
 * Date: 2026-01-13
 *
 * Enhanced current user hook with person data and computed values
 * Replaces the simple useAuth re-export
 */

import { useMemo } from 'react';
import { useAuthStore } from '../model/authStore';
import { getDisplayName, getPrimaryEmail, getPrimaryPhone } from '@/shared/lib/person-helpers';
import type { User } from '@/shared/types/auth';
import type { IPerson } from '@/shared/types/person';

/**
 * Current user data with computed convenience values
 */
export interface CurrentUserData {
  /** The full user object */
  user: User | null;

  /** Is user authenticated */
  isAuthenticated: boolean;

  /** Is auth loading */
  isLoading: boolean;

  /** Person data (v2.0) */
  person: IPerson | null;

  /** Computed: Display name (preferred or legal) */
  displayName: string;

  /** Computed: Primary email address */
  primaryEmail: string | null;

  /** Computed: Primary phone number */
  primaryPhone: string | null;
}

/**
 * Get current user with person data and computed values
 *
 * Returns enhanced user data including:
 * - Full user and person objects
 * - Computed convenience values (displayName, primaryEmail, primaryPhone)
 * - Authentication state
 *
 * @returns CurrentUserData object
 *
 * @example
 * ```tsx
 * function UserProfile() {
 *   const { displayName, primaryEmail, person, isAuthenticated } = useCurrentUser();
 *
 *   if (!isAuthenticated) {
 *     return <LoginPrompt />;
 *   }
 *
 *   return (
 *     <div>
 *       <h1>{displayName}</h1>
 *       <p>{primaryEmail}</p>
 *       {person && <PersonDetails person={person} />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useCurrentUser(): CurrentUserData {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  return useMemo(() => {
    const person = user?.person || null;

    // Compute display name
    let displayName = '';
    if (person) {
      displayName = getDisplayName(person);
    } else if (user?.firstName || user?.lastName) {
      // Fallback to deprecated fields
      const firstName = user.firstName?.trim() || '';
      const lastName = user.lastName?.trim() || '';
      displayName = `${firstName} ${lastName}`.trim();
    }

    // Compute primary email
    let primaryEmail: string | null = null;
    if (person) {
      const primaryEmailObj = getPrimaryEmail(person);
      primaryEmail = primaryEmailObj?.email || null;
    }
    // Fallback to user.email if no person data
    if (!primaryEmail && user?.email) {
      primaryEmail = user.email;
    }

    // Compute primary phone
    let primaryPhone: string | null = null;
    if (person) {
      const primaryPhoneObj = getPrimaryPhone(person);
      primaryPhone = primaryPhoneObj?.number || null;
    }

    return {
      user,
      isAuthenticated,
      isLoading,
      person,
      displayName,
      primaryEmail,
      primaryPhone,
    };
  }, [user, isAuthenticated, isLoading]);
}
