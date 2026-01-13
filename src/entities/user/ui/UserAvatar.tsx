/**
 * UserAvatar Component - Phase 3 Update
 * Version: 2.0.0
 * Date: 2026-01-13
 *
 * Displays user avatar with support for Person v2.0 data structure
 * Features:
 * - Accepts avatar URL from person.avatar or direct URL
 * - Fallback to initials from display name
 * - Size variants (sm, md, lg) via className
 * - Accessible with alt text
 */

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { cn } from '@/shared/lib/utils';
import { getDisplayName } from '@/shared/lib/person-helpers';
import type { IPerson } from '@/shared/types/person';

/**
 * Size variant classes for UserAvatar
 */
export const avatarSizeClasses = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-base',
  xl: 'h-20 w-20 text-lg',
} as const;

export type AvatarSize = keyof typeof avatarSizeClasses;

interface UserAvatarProps {
  /**
   * Display name for the user (used for alt text and initials)
   * If not provided, will be computed from person data
   */
  displayName?: string;

  /**
   * Person data (v2.0) - preferred source
   */
  person?: IPerson;

  /**
   * Direct avatar URL (fallback if person data not available)
   */
  avatar?: string;

  /**
   * DEPRECATED: Direct first name (v1.0 compatibility)
   * Use person data or displayName instead
   */
  firstName?: string;

  /**
   * DEPRECATED: Direct last name (v1.0 compatibility)
   * Use person data or displayName instead
   */
  lastName?: string;

  /**
   * Size variant
   */
  size?: AvatarSize;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Get initials from display name
 */
function getInitials(name: string): string {
  if (!name || !name.trim()) {
    return 'U'; // Default fallback
  }

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    // Single name - take first 2 characters
    return parts[0].substring(0, 2).toUpperCase();
  }

  // Multiple parts - take first char of first and last part
  const first = parts[0].charAt(0);
  const last = parts[parts.length - 1].charAt(0);
  return `${first}${last}`.toUpperCase();
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  displayName: providedDisplayName,
  person,
  avatar: providedAvatar,
  firstName,
  lastName,
  size = 'md',
  className,
}) => {
  // Compute display name from available sources
  const displayName = React.useMemo(() => {
    // Priority 1: Provided display name
    if (providedDisplayName) {
      return providedDisplayName;
    }

    // Priority 2: Person data (v2.0)
    if (person) {
      return getDisplayName(person);
    }

    // Priority 3: Deprecated firstName/lastName (v1.0 compatibility)
    if (firstName || lastName) {
      return `${firstName || ''} ${lastName || ''}`.trim();
    }

    return '';
  }, [providedDisplayName, person, firstName, lastName]);

  // Compute avatar URL from available sources
  const avatarUrl = React.useMemo(() => {
    // Priority 1: Person data avatar
    if (person?.avatar) {
      return person.avatar;
    }

    // Priority 2: Direct avatar prop
    if (providedAvatar) {
      return providedAvatar;
    }

    return undefined;
  }, [person, providedAvatar]);

  const initials = getInitials(displayName);
  const sizeClass = avatarSizeClasses[size];

  return (
    <Avatar className={cn(sizeClass, className)}>
      <AvatarImage
        src={avatarUrl}
        alt={displayName || 'User'}
      />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
};
