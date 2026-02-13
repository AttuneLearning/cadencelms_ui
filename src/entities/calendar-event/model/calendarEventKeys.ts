/**
 * React Query keys for Calendar Events
 */

import type { CalendarFeedId, CalendarFeedFilters } from './types';

export const calendarEventKeys = {
  // All calendar queries
  all: ['calendar-events'] as const,

  // Feed queries
  feeds: () => [...calendarEventKeys.all, 'feed'] as const,
  feed: (feedId: CalendarFeedId, filters?: CalendarFeedFilters) =>
    [...calendarEventKeys.feeds(), feedId, filters] as const,

  // Reminders
  reminders: () => [...calendarEventKeys.all, 'reminders'] as const,
  reminder: (eventId: string) =>
    [...calendarEventKeys.reminders(), eventId] as const,
};
