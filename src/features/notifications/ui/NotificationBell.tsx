/**
 * NotificationBell Component
 * Header component for displaying notification count and quick access to notifications
 */

import React from 'react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover';
import { Separator } from '@/shared/ui/separator';
import { Bell, BellRing, Settings, ExternalLink } from 'lucide-react';
import { NotificationItem } from './NotificationItem';
import type { NotificationSummary } from '@/entities/notification';
import { cn } from '@/shared/lib/utils';

interface NotificationBellProps {
  summary: NotificationSummary | null;
  isLoading?: boolean;
  onViewAll?: () => void;
  onSettings?: () => void;
  onNotificationClick?: (notificationId: string) => void;
  onMarkAsRead?: (notificationId: string) => void;
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  summary,
  isLoading = false,
  onViewAll,
  onSettings,
  onNotificationClick,
  onMarkAsRead,
  className,
}) => {
  const [open, setOpen] = React.useState(false);

  const hasUnread = summary && summary.unreadCount > 0;
  const hasUrgent = summary && summary.urgentCount > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('relative h-9 w-9 p-0', className)}
        >
          {hasUrgent ? (
            <BellRing className="h-5 w-5 animate-pulse text-amber-500" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {hasUnread && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 min-w-[1.25rem] px-1 text-xs"
            >
              {summary.unreadCount > 99 ? '99+' : summary.unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="font-semibold">Notifications</h4>
          {onSettings && (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onSettings}>
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="animate-pulse text-sm text-muted-foreground">Loading...</div>
          </div>
        ) : !summary || summary.recentNotifications.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-center">
            <Bell className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">No notifications</p>
          </div>
        ) : (
          <>
            <div className="max-h-[300px] overflow-y-auto">
              <div className="divide-y">
                {summary.recentNotifications.slice(0, 5).map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    compact
                    onClick={() => {
                      onNotificationClick?.(notification.id);
                      setOpen(false);
                    }}
                    onMarkAsRead={() => onMarkAsRead?.(notification.id)}
                  />
                ))}
              </div>
            </div>

            {/* Footer */}
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center"
                onClick={() => {
                  onViewAll?.();
                  setOpen(false);
                }}
              >
                View All Notifications
                <ExternalLink className="ml-2 h-3 w-3" />
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};
