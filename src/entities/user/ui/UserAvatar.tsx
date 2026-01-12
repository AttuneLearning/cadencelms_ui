/**
 * UserAvatar Component
 * Displays user avatar with fallback to initials
 */

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { cn } from '@/shared/lib/utils';

interface UserAvatarProps {
  firstName: string;
  lastName: string;
  avatar?: string;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  firstName,
  lastName,
  avatar,
  className,
}) => {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <Avatar className={cn('h-10 w-10', className)}>
      <AvatarImage src={avatar} alt={`${firstName} ${lastName}`} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
};
