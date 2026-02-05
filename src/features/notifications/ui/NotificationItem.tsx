/**
 * NotificationItem Component
 * Displays a single notification with actions
 */

import React from 'react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import {
  BookOpen,
  Award,
  Clock,
  RefreshCw,
  Bell,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import type { NotificationListItem } from '@/entities/notification';
import { getNotificationIcon, getNotificationPriority } from '@/entities/notification';
import { cn } from '@/shared/lib/utils';

interface NotificationItemProps {
  notification: NotificationListItem;
  compact?: boolean;
  onClick?: () => void;
  onMarkAsRead?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  book: BookOpen,
  award: Award,
  clock: Clock,
  refresh: RefreshCw,
  bell: Bell,
};

const priorityColors: Record<string, string> = {
  urgent: 'border-l-destructive',
  high: 'border-l-amber-500',
  normal: 'border-l-primary',
  low: 'border-l-muted-foreground',
};

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  compact = false,
  onClick,
  onMarkAsRead,
  onDismiss,
  className,
}) => {
  const iconName = getNotificationIcon(notification.type);
  const Icon = iconMap[iconName] || Bell;
  const priority = notification.priority || getNotificationPriority(notification.type);

  if (compact) {
    return (
      <div
        className={cn(
          'flex cursor-pointer gap-3 px-4 py-3 transition-colors hover:bg-muted/50',
          !notification.isRead && 'bg-primary/5',
          className
        )}
        onClick={onClick}
      >
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
            priority === 'urgent' ? 'bg-destructive/10' : 'bg-primary/10'
          )}
        >
          <Icon
            className={cn(
              'h-4 w-4',
              priority === 'urgent' ? 'text-destructive' : 'text-primary'
            )}
          />
        </div>
        <div className="flex-1 overflow-hidden">
          <p
            className={cn(
              'line-clamp-1 text-sm',
              !notification.isRead && 'font-medium'
            )}
          >
            {notification.title}
          </p>
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {formatRelativeTime(notification.sentAt)}
          </p>
        </div>
        {!notification.isRead && (
          <div className="h-2 w-2 shrink-0 rounded-full bg-primary" />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'border-l-4 p-4 transition-colors',
        priorityColors[priority],
        !notification.isRead && 'bg-primary/5',
        onClick && 'cursor-pointer hover:bg-muted/50',
        className
      )}
      onClick={onClick}
    >
      <div className="flex gap-3">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
            priority === 'urgent' ? 'bg-destructive/10' : 'bg-primary/10'
          )}
        >
          <Icon
            className={cn(
              'h-5 w-5',
              priority === 'urgent' ? 'text-destructive' : 'text-primary'
            )}
          />
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p className={cn('text-sm', !notification.isRead && 'font-semibold')}>
              {notification.title}
            </p>
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatRelativeTime(notification.sentAt)}
            </span>
          </div>

          <p className="text-sm text-muted-foreground">{notification.message}</p>

          {/* Priority badge for urgent/high */}
          {(priority === 'urgent' || priority === 'high') && (
            <Badge
              variant={priority === 'urgent' ? 'destructive' : 'default'}
              className="mt-2 text-xs"
            >
              {priority === 'urgent' ? 'Urgent' : 'Important'}
            </Badge>
          )}

          {/* Actions */}
          <div className="mt-3 flex items-center gap-2">
            {notification.actionUrl && notification.actionLabel && (
              <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                {notification.actionLabel}
                <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            )}

            {!notification.isRead && onMarkAsRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead();
                }}
              >
                <Check className="mr-1 h-3 w-3" />
                Mark as read
              </Button>
            )}

            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss();
                }}
              >
                <X className="mr-1 h-3 w-3" />
                Dismiss
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
