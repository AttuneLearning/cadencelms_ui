/**
 * User Profile Avatar Component
 * Compact avatar for use in navigation, headers, etc.
 */

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import type { UserProfile } from '../model/types';

interface UserProfileAvatarProps {
  profile: UserProfile;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function UserProfileAvatar({ profile, size = 'md', className = '' }: UserProfileAvatarProps) {
  const initials = `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
  const fullName = `${profile.firstName} ${profile.lastName}`;

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage src={profile.profileImage || undefined} alt={fullName} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
