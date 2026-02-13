/**
 * Calendar event mock data for tests
 */

import type {
  CalendarPointEvent,
  CalendarSpanEvent,
  CalendarEvent,
  CalendarFeed,
} from '@/entities/calendar-event';

export function createMockPointEvent(
  overrides: Partial<CalendarPointEvent> = {}
): CalendarPointEvent {
  return {
    id: 'point-1',
    feedId: 'learner',
    kind: 'point',
    title: 'Mock Point Event',
    date: '2026-03-15T00:00:00.000Z',
    eventType: 'deadline',
    ...overrides,
  };
}

export function createMockSpanEvent(
  overrides: Partial<CalendarSpanEvent> = {}
): CalendarSpanEvent {
  return {
    id: 'span-1',
    feedId: 'learner',
    kind: 'span',
    title: 'Mock Span Event',
    startDate: '2026-03-10T00:00:00.000Z',
    endDate: '2026-03-20T00:00:00.000Z',
    eventType: 'enrollment-start',
    ...overrides,
  };
}

export function createMockFeed(
  overrides: Partial<CalendarFeed> = {}
): CalendarFeed {
  return {
    id: 'learner',
    label: 'My Events',
    color: 'primary',
    enabled: true,
    isLoading: false,
    events: [createMockPointEvent(), createMockSpanEvent()],
    ...overrides,
  };
}

export const MOCK_LEARNER_EVENTS: CalendarEvent[] = [
  createMockPointEvent({ id: 'l1', title: 'Enrolled in Safety' }),
  createMockPointEvent({ id: 'l2', title: 'Assignment Due', date: '2026-03-20T00:00:00.000Z' }),
  createMockSpanEvent({ id: 'l3', title: 'Access Window' }),
];

export const MOCK_STAFF_EVENTS: CalendarEvent[] = [
  createMockPointEvent({
    id: 's1',
    feedId: 'staff',
    title: 'Class Session',
    eventType: 'class-session',
    time: '9:00 AM',
    location: 'Room 201',
  }),
  createMockSpanEvent({
    id: 's2',
    feedId: 'staff',
    title: 'Grading Period',
    eventType: 'grading-deadline',
  }),
];

export const MOCK_SYSTEM_EVENTS: CalendarEvent[] = [
  createMockPointEvent({
    id: 'sys1',
    feedId: 'system',
    title: 'System Maintenance',
    eventType: 'system-event',
  }),
  createMockSpanEvent({
    id: 'sys2',
    feedId: 'system',
    title: 'Fall Semester',
    eventType: 'academic-date',
    startDate: '2026-03-01T00:00:00.000Z',
    endDate: '2026-06-15T00:00:00.000Z',
  }),
];
