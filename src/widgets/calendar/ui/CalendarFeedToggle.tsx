/**
 * CalendarFeedToggle — Checkbox + color dot + label for toggling a feed
 */

import React from 'react';
import { Checkbox } from '@/shared/ui/checkbox';
import { cn } from '@/shared/lib/utils/index';
import type { CalendarFeed } from '@/entities/calendar-event';
import { FEED_COLOR_MAP } from '@/entities/calendar-event';

interface CalendarFeedToggleProps {
  feed: CalendarFeed;
  onToggle: (feedId: CalendarFeed['id']) => void;
}

export const CalendarFeedToggle: React.FC<CalendarFeedToggleProps> = ({
  feed,
  onToggle,
}) => {
  const dotClass = FEED_COLOR_MAP[feed.color].dot;

  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <Checkbox
        checked={feed.enabled}
        onCheckedChange={() => onToggle(feed.id)}
        aria-label={`Toggle ${feed.label} feed`}
      />
      <span className={cn('h-2.5 w-2.5 rounded-full', dotClass)} />
      <span className="select-none">{feed.label}</span>
      {feed.isLoading && (
        <span className="text-xs text-muted-foreground">(loading...)</span>
      )}
    </label>
  );
};
