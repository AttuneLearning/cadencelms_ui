/**
 * UserCard Component - Phase 3
 * Version: 2.0.0
 * Date: 2026-01-13
 *
 * Display user information card with person data support
 * Features:
 * - Display name with preferred name support
 * - Show pronouns if set
 * - Show primary contact info (email, phone)
 * - Show avatar using UserAvatar
 * - Flexible layout (vertical/horizontal)
 */

import React from 'react';
import { Mail, Phone, User as UserIcon } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/shared/ui/card';
import { UserAvatar } from '@/entities/user/ui/UserAvatar';
import { cn } from '@/shared/lib/utils';
import { getDisplayName, getPrimaryEmail, getPrimaryPhone } from '@/shared/lib/person-helpers';
import type { IPerson } from '@/shared/types/person';
import type { AvatarSize } from '@/entities/user/ui/UserAvatar';

export interface UserCardProps {
  /**
   * Person data (v2.0) - preferred source
   */
  person?: IPerson;

  /**
   * Display name override
   */
  displayName?: string;

  /**
   * Email override (if not using person data)
   */
  email?: string;

  /**
   * Phone override (if not using person data)
   */
  phone?: string;

  /**
   * Avatar URL override
   */
  avatar?: string;

  /**
   * Show pronouns badge
   */
  showPronouns?: boolean;

  /**
   * Show contact information
   */
  showContact?: boolean;

  /**
   * Show bio/headline
   */
  showBio?: boolean;

  /**
   * Layout orientation
   */
  layout?: 'vertical' | 'horizontal';

  /**
   * Avatar size
   */
  avatarSize?: AvatarSize;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Click handler
   */
  onClick?: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  person,
  displayName: providedDisplayName,
  email: providedEmail,
  phone: providedPhone,
  avatar: providedAvatar,
  showPronouns = false,
  showContact = true,
  showBio = false,
  layout = 'vertical',
  avatarSize = 'lg',
  className,
  onClick,
}) => {
  // Compute display name
  const displayName = React.useMemo(() => {
    if (providedDisplayName) {
      return providedDisplayName;
    }

    if (person) {
      return getDisplayName(person);
    }

    return '';
  }, [providedDisplayName, person]);

  // Compute primary email
  const primaryEmail = React.useMemo(() => {
    if (providedEmail) {
      return providedEmail;
    }

    if (person) {
      const emailObj = getPrimaryEmail(person);
      return emailObj?.email || null;
    }

    return null;
  }, [providedEmail, person]);

  // Compute primary phone
  const primaryPhone = React.useMemo(() => {
    if (providedPhone) {
      return providedPhone;
    }

    if (person) {
      const phoneObj = getPrimaryPhone(person);
      return phoneObj?.number || null;
    }

    return null;
  }, [providedPhone, person]);

  // Get pronouns
  const pronouns = person?.pronouns || null;

  // Get bio
  const bio = person?.bio || null;

  const isHorizontal = layout === 'horizontal';

  return (
    <Card
      className={cn(
        'overflow-hidden',
        onClick && 'cursor-pointer hover:bg-accent/50 transition-colors',
        className
      )}
      onClick={onClick}
    >
      <CardContent
        className={cn(
          'p-4',
          isHorizontal ? 'flex items-center gap-4' : 'flex flex-col items-center text-center'
        )}
      >
        {/* Avatar */}
        <UserAvatar
          person={person}
          displayName={displayName}
          avatar={providedAvatar}
          size={avatarSize}
        />

        {/* User Info */}
        <div className={cn('flex-1', isHorizontal ? 'text-left' : 'mt-4')}>
          {/* Name */}
          <div className="space-y-1">
            <h3 className="font-semibold text-lg leading-none">
              {displayName || 'Unknown User'}
            </h3>

            {/* Pronouns */}
            {showPronouns && pronouns && (
              <p className="text-sm text-muted-foreground italic">
                ({pronouns})
              </p>
            )}
          </div>

          {/* Bio */}
          {showBio && bio && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {bio}
            </p>
          )}

          {/* Contact Info */}
          {showContact && (primaryEmail || primaryPhone) && (
            <div className={cn('mt-3 space-y-2', isHorizontal ? '' : 'flex flex-col items-center')}>
              {primaryEmail && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{primaryEmail}</span>
                </div>
              )}

              {primaryPhone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{primaryPhone}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
