/**
 * NotificationList Component
 * Full list of notifications with filtering and bulk actions
 */

import React from 'react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Checkbox } from '@/shared/ui/checkbox';
import { Skeleton } from '@/shared/ui/skeleton';
import { Separator } from '@/shared/ui/separator';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { NotificationItem } from './NotificationItem';
import type { NotificationListItem, NotificationType } from '@/entities/notification';
import { cn } from '@/shared/lib/utils';

interface NotificationListProps {
  notifications: NotificationListItem[];
  isLoading?: boolean;
  totalCount?: number;
  unreadCount?: number;
  filter: {
    type?: NotificationType;
    isRead?: boolean;
  };
  onFilterChange: (filter: { type?: NotificationType; isRead?: boolean }) => void;
  onNotificationClick?: (notification: NotificationListItem) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  onDismiss?: (notificationId: string) => void;
  onRefresh?: () => void;
  className?: string;
}

const typeOptions: Array<{ value: NotificationType | 'all'; label: string }> = [
  { value: 'all', label: 'All Types' },
  { value: 'course_version_available', label: 'Course Updates' },
  { value: 'certificate_earned', label: 'Certificates Earned' },
  { value: 'certificate_upgrade_available', label: 'Certificate Upgrades' },
  { value: 'access_expiring_soon', label: 'Access Expiring' },
  { value: 'access_expired', label: 'Access Expired' },
  { value: 'badge_earned', label: 'Badges Earned' },
];

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  isLoading = false,
  totalCount,
  unreadCount = 0,
  filter,
  onFilterChange,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
  onRefresh,
  className,
}) => {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(notifications.map((n) => n.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const handleBulkMarkAsRead = () => {
    selectedIds.forEach((id) => onMarkAsRead?.(id));
    setSelectedIds(new Set());
  };

  const handleBulkDismiss = () => {
    selectedIds.forEach((id) => onDismiss?.(id));
    setSelectedIds(new Set());
  };

  const allSelected = notifications.length > 0 && selectedIds.size === notifications.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < notifications.length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Notifications</h2>
          {totalCount !== undefined && (
            <Badge variant="secondary">{totalCount} total</Badge>
          )}
          {unreadCount > 0 && (
            <Badge variant="default">{unreadCount} unread</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
              <RefreshCw className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')} />
              Refresh
            </Button>
          )}
          {unreadCount > 0 && onMarkAllAsRead && (
            <Button variant="outline" size="sm" onClick={onMarkAllAsRead}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark All as Read
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filter:</span>
        </div>

        <Select
          value={filter.type || 'all'}
          onValueChange={(value) =>
            onFilterChange({
              ...filter,
              type: value === 'all' ? undefined : (value as NotificationType),
            })
          }
        >
          <SelectTrigger className="h-8 w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            {typeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filter.isRead === undefined ? 'all' : filter.isRead ? 'read' : 'unread'}
          onValueChange={(value) =>
            onFilterChange({
              ...filter,
              isRead: value === 'all' ? undefined : value === 'read',
            })
          }
        >
          <SelectTrigger className="h-8 w-[120px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <>
          <Separator />
          <div className="flex items-center justify-between rounded-lg bg-muted p-3">
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} notification(s) selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleBulkMarkAsRead}>
                <Check className="mr-2 h-4 w-4" />
                Mark as Read
              </Button>
              {onDismiss && (
                <Button variant="outline" size="sm" onClick={handleBulkDismiss}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Dismiss
                </Button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Select all checkbox */}
      {notifications.length > 0 && (
        <div className="flex items-center gap-2 px-4">
          <Checkbox
            checked={allSelected}
            ref={(el) => {
              if (el) {
                (el as HTMLButtonElement & { indeterminate: boolean }).indeterminate = someSelected;
              }
            }}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm text-muted-foreground">Select all</span>
        </div>
      )}

      {/* Notification list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <NotificationSkeleton key={i} />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <Bell className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">No notifications found</p>
          {(filter.type || filter.isRead !== undefined) && (
            <Button
              variant="link"
              onClick={() => onFilterChange({})}
              className="mt-2"
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="divide-y rounded-lg border">
          {notifications.map((notification) => (
            <div key={notification.id} className="flex items-start gap-3 p-4">
              <Checkbox
                checked={selectedIds.has(notification.id)}
                onCheckedChange={(checked) =>
                  handleSelectOne(notification.id, checked as boolean)
                }
                className="mt-3"
              />
              <div className="flex-1">
                <NotificationItem
                  notification={notification}
                  onClick={() => onNotificationClick?.(notification)}
                  onMarkAsRead={() => onMarkAsRead?.(notification.id)}
                  onDismiss={onDismiss ? () => onDismiss(notification.id) : undefined}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Skeleton for loading state
 */
const NotificationSkeleton: React.FC = () => (
  <div className="flex gap-3 rounded-lg border p-4">
    <Skeleton className="h-10 w-10 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  </div>
);
