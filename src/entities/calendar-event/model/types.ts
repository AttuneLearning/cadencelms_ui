/**
 * Calendar Event Entity Types
 * Discriminated union for point vs span events, feed configuration, and API contracts
 */

// =====================
// FEED IDENTIFIERS
// =====================

/** Feed identifiers — one per API endpoint */
export type CalendarFeedId = 'learner' | 'staff' | 'system';

/** Semantic color tokens for feed styling */
export type FeedColor = 'primary' | 'destructive' | 'orange' | 'emerald' | 'violet' | 'secondary';

// =====================
// EVENT TYPES
// =====================

/** Event type strings for categorisation within a feed */
export type CalendarEventType =
  // Learner feed
  | 'enrollment-start'
  | 'enrollment-expiry'
  | 'deadline'
  | 'class-session'
  // Staff feed
  | 'office-hours'
  | 'meeting'
  | 'grading-deadline'
  // System feed
  | 'system-event'
  | 'academic-date'
  | 'department-event'
  | 'maintenance-window';

// =====================
// CALENDAR EVENTS (discriminated union)
// =====================

/** Fields shared by every event */
interface CalendarEventBase {
  id: string;
  feedId: CalendarFeedId;
  title: string;
  description?: string;
  eventType: CalendarEventType;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

/** Point event — single date, optional time/location */
export interface CalendarPointEvent extends CalendarEventBase {
  kind: 'point';
  date: string; // ISO date string
  time?: string; // e.g. "9:00 AM - 10:30 AM"
  location?: string;
}

/** Span event — date range (inclusive start/end) */
export interface CalendarSpanEvent extends CalendarEventBase {
  kind: 'span';
  startDate: string; // ISO date string
  endDate: string; // ISO date string
}

/** Discriminated union */
export type CalendarEvent = CalendarPointEvent | CalendarSpanEvent;

// =====================
// TYPE GUARDS
// =====================

export function isPointEvent(event: CalendarEvent): event is CalendarPointEvent {
  return event.kind === 'point';
}

export function isSpanEvent(event: CalendarEvent): event is CalendarSpanEvent {
  return event.kind === 'span';
}

// =====================
// FEED CONFIGURATION
// =====================

/** Runtime feed state assembled by pages and passed to CalendarWidget */
export interface CalendarFeed {
  id: CalendarFeedId;
  label: string;
  color: FeedColor;
  enabled: boolean;
  isLoading: boolean;
  events: CalendarEvent[];
}

/** Static feed config used in page definitions */
export interface CalendarFeedConfig {
  id: CalendarFeedId;
  label: string;
  color: FeedColor;
}

// =====================
// API CONTRACTS
// =====================

export interface CalendarFeedFilters {
  startDate: string; // ISO date
  endDate: string; // ISO date
}

export interface CalendarFeedResponse {
  events: CalendarEvent[];
}

// =====================
// REMINDER (deferred — types ready)
// =====================

export interface CalendarReminder {
  id: string;
  eventId: string;
  /** Minutes before the event to fire the reminder */
  minutesBefore: number;
  createdAt: string;
}

export interface CreateReminderPayload {
  eventId: string;
  minutesBefore: number;
}
