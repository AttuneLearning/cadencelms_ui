/**
 * ExpiryBadge Component
 * Displays expiry status for enrollments with color-coded badges
 */

import React from 'react';
import { Badge } from '@/shared/ui/badge';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { getExpiryStatus, type ExpiryStatus } from '../lib/expiryUtils';
import { cn } from '@/shared/lib/utils';

interface ExpiryBadgeProps {
  expiresAt: string | null | undefined;
  className?: string;
  showIcon?: boolean;
  variant?: 'default' | 'compact';
}

/**
 * Get badge variant and styles based on expiry status
 */
function getBadgeConfig(status: ExpiryStatus): {
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  className: string;
  icon: React.ComponentType<{ className?: string }>;
} {
  switch (status) {
    case 'active':
      return {
        variant: 'secondary',
        className: 'bg-green-100 text-green-800 hover:bg-green-100',
        icon: CheckCircle,
      };
    case 'expiring_soon':
      return {
        variant: 'secondary',
        className: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
        icon: AlertCircle,
      };
    case 'expired':
      return {
        variant: 'destructive',
        className: 'bg-red-100 text-red-800 hover:bg-red-100',
        icon: XCircle,
      };
    case 'no_expiry':
      return {
        variant: 'outline',
        className: 'text-muted-foreground',
        icon: Clock,
      };
  }
}

export const ExpiryBadge: React.FC<ExpiryBadgeProps> = ({
  expiresAt,
  className,
  showIcon = true,
  variant = 'default',
}) => {
  const expiryInfo = getExpiryStatus(expiresAt);
  const config = getBadgeConfig(expiryInfo.status);
  const Icon = config.icon;

  // Don't show badge if no expiry
  if (expiryInfo.status === 'no_expiry') {
    return null;
  }

  const isCompact = variant === 'compact';

  return (
    <Badge
      variant={config.variant}
      className={cn(
        config.className,
        isCompact ? 'text-xs px-2 py-0.5' : 'text-xs',
        className
      )}
    >
      {showIcon && <Icon className={cn('h-3 w-3', !isCompact && 'mr-1')} />}
      {!isCompact && expiryInfo.label}
      {isCompact && expiryInfo.daysRemaining !== null && (
        <span className="ml-1 font-medium">{Math.abs(expiryInfo.daysRemaining)}d</span>
      )}
    </Badge>
  );
};

/**
 * ExpiryWarning Component
 * Displays a more prominent warning for expiring/expired enrollments
 */
interface ExpiryWarningProps {
  expiresAt: string | null | undefined;
  className?: string;
}

export const ExpiryWarning: React.FC<ExpiryWarningProps> = ({
  expiresAt,
  className,
}) => {
  const expiryInfo = getExpiryStatus(expiresAt);

  // Only show warning for expiring soon or expired
  if (expiryInfo.status !== 'expiring_soon' && expiryInfo.status !== 'expired') {
    return null;
  }

  const isExpired = expiryInfo.status === 'expired';

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md border px-3 py-2 text-sm',
        isExpired
          ? 'border-red-200 bg-red-50 text-red-800'
          : 'border-amber-200 bg-amber-50 text-amber-800',
        className
      )}
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1">{expiryInfo.label}</span>
    </div>
  );
};
