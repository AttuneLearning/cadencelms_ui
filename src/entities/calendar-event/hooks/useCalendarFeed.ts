/**
 * React Query hooks for Calendar Feeds
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
  fetchLearnerFeed,
  fetchStaffFeed,
  fetchSystemFeed,
} from '../api/calendarEventApi';
import { calendarEventKeys } from '../model/calendarEventKeys';
import type {
  CalendarFeedId,
  CalendarFeedFilters,
  CalendarFeedResponse,
} from '../model/types';

const FEED_FETCHERS: Record<
  CalendarFeedId,
  (filters: CalendarFeedFilters) => Promise<CalendarFeedResponse>
> = {
  learner: fetchLearnerFeed,
  staff: fetchStaffFeed,
  system: fetchSystemFeed,
};

/**
 * Hook to fetch a calendar feed by ID.
 * Automatically selects the correct API endpoint based on feedId.
 */
export function useCalendarFeed(
  feedId: CalendarFeedId,
  filters: CalendarFeedFilters,
  options?: Omit<
    UseQueryOptions<
      CalendarFeedResponse,
      Error,
      CalendarFeedResponse,
      ReturnType<typeof calendarEventKeys.feed>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: calendarEventKeys.feed(feedId, filters),
    queryFn: () => FEED_FETCHERS[feedId](filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}
