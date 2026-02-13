/**
 * CalendarSidebar — Feed toggles + selected day event detail + legend
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import type { CalendarEvent, CalendarFeed, CalendarFeedId } from '@/entities/calendar-event';
import { allEventsForDay } from '@/entities/calendar-event';
import { CalendarFeedToggle } from './CalendarFeedToggle';
import { CalendarEventChip } from './CalendarEventChip';

interface CalendarSidebarProps {
  feeds: CalendarFeed[];
  selectedDay: Date | null;
  onToggleFeed: (feedId: CalendarFeedId) => void;
}

export const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  feeds,
  selectedDay,
  onToggleFeed,
}) => {
  const navigate = useNavigate();

  // Gather selected day events from all enabled feeds
  const selectedDayEvents: Array<{ event: CalendarEvent; feed: CalendarFeed }> = [];
  if (selectedDay) {
    for (const feed of feeds) {
      if (!feed.enabled) continue;
      const dayEvents = allEventsForDay(feed.events, selectedDay);
      for (const event of dayEvents) {
        selectedDayEvents.push({ event, feed });
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Feed toggles (only when multiple feeds) */}
      {feeds.length > 1 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Feeds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {feeds.map((feed) => (
              <CalendarFeedToggle
                key={feed.id}
                feed={feed}
                onToggle={onToggleFeed}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Selected day events */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {selectedDay ? format(selectedDay, 'EEEE, MMMM d') : 'Select a day'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedDay && (
            <p className="text-sm text-muted-foreground">
              Click a day on the calendar to see its events.
            </p>
          )}

          {selectedDay && selectedDayEvents.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
              <CalendarDays className="h-8 w-8 opacity-40" />
              <p className="text-sm">No events on this day</p>
            </div>
          )}

          {selectedDayEvents.length > 0 && (
            <ul className="space-y-2">
              {selectedDayEvents.map(({ event, feed }) => (
                <li key={event.id}>
                  <CalendarEventChip
                    event={event}
                    feedColor={feed.color}
                    onClick={
                      event.actionUrl
                        ? () => navigate(event.actionUrl!)
                        : undefined
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
