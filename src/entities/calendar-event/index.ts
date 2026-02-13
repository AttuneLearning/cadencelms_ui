/**
 * Calendar Event Entity
 * Public API for calendar events, feeds, and rendering utilities
 */

// Types
export type {
  CalendarFeedId,
  FeedColor,
  CalendarEventType,
  CalendarPointEvent,
  CalendarSpanEvent,
  CalendarEvent,
  CalendarFeed,
  CalendarFeedConfig,
  CalendarFeedFilters,
  CalendarFeedResponse,
  CalendarReminder,
  CreateReminderPayload,
} from './model/types';

// Type guards
export { isPointEvent, isSpanEvent } from './model/types';

// Query keys
export { calendarEventKeys } from './model/calendarEventKeys';

// API
export {
  fetchLearnerFeed,
  fetchStaffFeed,
  fetchSystemFeed,
  createReminder,
  deleteReminder,
} from './api/calendarEventApi';

// Hooks
export { useCalendarFeed } from './hooks/useCalendarFeed';
export { useCalendarFeedPlaceholder } from './hooks/useCalendarFeedPlaceholder';

// Utils
export {
  WEEKDAY_LABELS,
  buildCalendarDays,
  getVisibleRange,
  pointEventsForDay,
  spanEventsForDay,
  allEventsForDay,
  splitSpanIntoWeekSegments,
} from './lib/calendarUtils';
export type { WeekSegment } from './lib/calendarUtils';

// Feed colors
export { FEED_COLOR_MAP } from './lib/feedColors';
export type { FeedColorClasses } from './lib/feedColors';
