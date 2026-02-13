/**
 * Placeholder data hooks for calendar feeds
 * Returns realistic sample data until the API ships.
 * Includes both point and span events to exercise all rendering paths.
 */

import { useMemo } from 'react';
import type { CalendarEvent, CalendarFeedId } from '../model/types';

function makeLearnerEvents(): CalendarEvent[] {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  return [
    // Point events
    {
      id: 'l-1',
      feedId: 'learner',
      kind: 'point',
      title: 'Safety Fundamentals — enrolled',
      date: new Date(y, m, 3).toISOString(),
      eventType: 'enrollment-start',
      actionUrl: '/learner/courses',
    },
    {
      id: 'l-2',
      feedId: 'learner',
      kind: 'point',
      title: 'Module 2 Assignment due',
      date: new Date(y, m, 15).toISOString(),
      eventType: 'deadline',
      actionUrl: '/learner/courses',
    },
    {
      id: 'l-3',
      feedId: 'learner',
      kind: 'point',
      title: 'Compliance 101 — enrolled',
      date: new Date(y, m, 1).toISOString(),
      eventType: 'enrollment-start',
      actionUrl: '/learner/courses',
    },
    {
      id: 'l-4',
      feedId: 'learner',
      kind: 'point',
      title: 'Lab Safety Section A',
      date: new Date(y, m, 10).toISOString(),
      time: '2:00 PM - 3:30 PM',
      location: 'Lab 102',
      eventType: 'class-session',
    },
    // Span events
    {
      id: 'l-5',
      feedId: 'learner',
      kind: 'span',
      title: 'Safety Fundamentals — access window',
      startDate: new Date(y, m, 3).toISOString(),
      endDate: new Date(y, m, 28).toISOString(),
      eventType: 'enrollment-start',
      description: 'Active enrollment period',
    },
    {
      id: 'l-6',
      feedId: 'learner',
      kind: 'span',
      title: 'Compliance 101 — access window',
      startDate: new Date(y, m, 1).toISOString(),
      endDate: new Date(y, m + 1, 10).toISOString(),
      eventType: 'enrollment-start',
    },
  ];
}

function makeStaffEvents(): CalendarEvent[] {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  return [
    {
      id: 's-1',
      feedId: 'staff',
      kind: 'point',
      title: 'Safety Fundamentals — Section A',
      date: new Date(y, m, 3).toISOString(),
      time: '9:00 AM - 10:30 AM',
      location: 'Room 201',
      eventType: 'class-session',
    },
    {
      id: 's-2',
      feedId: 'staff',
      kind: 'point',
      title: 'Safety Fundamentals — Section B',
      date: new Date(y, m, 5).toISOString(),
      time: '1:00 PM - 2:30 PM',
      location: 'Room 201',
      eventType: 'class-session',
    },
    {
      id: 's-3',
      feedId: 'staff',
      kind: 'point',
      title: 'Office Hours',
      date: new Date(y, m, 7).toISOString(),
      time: '3:00 PM - 4:00 PM',
      location: 'Office 105',
      eventType: 'office-hours',
    },
    {
      id: 's-4',
      feedId: 'staff',
      kind: 'point',
      title: 'Department Meeting',
      date: new Date(y, m, 10).toISOString(),
      time: '11:00 AM - 12:00 PM',
      location: 'Conference Room A',
      eventType: 'meeting',
    },
    {
      id: 's-5',
      feedId: 'staff',
      kind: 'point',
      title: 'Compliance 101 — Section A',
      date: new Date(y, m, 12).toISOString(),
      time: '9:00 AM - 10:30 AM',
      location: 'Room 305',
      eventType: 'class-session',
    },
    {
      id: 's-6',
      feedId: 'staff',
      kind: 'point',
      title: 'Office Hours',
      date: new Date(y, m, 14).toISOString(),
      time: '3:00 PM - 4:00 PM',
      location: 'Office 105',
      eventType: 'office-hours',
    },
    {
      id: 's-7',
      feedId: 'staff',
      kind: 'point',
      title: 'Curriculum Review',
      date: new Date(y, m, 18).toISOString(),
      time: '2:00 PM - 3:00 PM',
      eventType: 'meeting',
    },
    // Span event
    {
      id: 's-8',
      feedId: 'staff',
      kind: 'span',
      title: 'Grading Period — Safety Fundamentals',
      startDate: new Date(y, m, 16).toISOString(),
      endDate: new Date(y, m, 22).toISOString(),
      eventType: 'grading-deadline',
      description: 'Submit all grades by end of period',
    },
  ];
}

function makeSystemEvents(): CalendarEvent[] {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  return [
    {
      id: 'sys-1',
      feedId: 'system',
      kind: 'point',
      title: 'System Maintenance Window',
      date: new Date(y, m, 2).toISOString(),
      time: '2:00 AM - 4:00 AM',
      eventType: 'system-event',
      description: 'Scheduled server maintenance and updates',
    },
    {
      id: 'sys-2',
      feedId: 'system',
      kind: 'point',
      title: 'Engineering Dept Town Hall',
      date: new Date(y, m, 8).toISOString(),
      time: '10:00 AM - 11:30 AM',
      eventType: 'department-event',
      description: 'Quarterly department review and planning',
    },
    {
      id: 'sys-3',
      feedId: 'system',
      kind: 'point',
      title: 'Enrollment Deadline',
      date: new Date(y, m, 12).toISOString(),
      eventType: 'academic-date',
      description: 'Last day to enroll in fall courses',
    },
    {
      id: 'sys-4',
      feedId: 'system',
      kind: 'point',
      title: 'Platform Update Release',
      date: new Date(y, m, 22).toISOString(),
      time: '6:00 AM - 7:00 AM',
      eventType: 'system-event',
      description: 'New platform version deployment',
    },
    // Span events
    {
      id: 'sys-5',
      feedId: 'system',
      kind: 'span',
      title: 'Fall Semester',
      startDate: new Date(y, m, 5).toISOString(),
      endDate: new Date(y, m + 3, 15).toISOString(),
      eventType: 'academic-date',
      description: 'Fall semester academic period',
    },
    {
      id: 'sys-6',
      feedId: 'system',
      kind: 'span',
      title: 'Safety Dept Training Week',
      startDate: new Date(y, m, 18).toISOString(),
      endDate: new Date(y, m, 22).toISOString(),
      eventType: 'department-event',
      description: 'Mandatory safety department training',
    },
    {
      id: 'sys-7',
      feedId: 'system',
      kind: 'span',
      title: 'Maintenance Window',
      startDate: new Date(y, m, 27).toISOString(),
      endDate: new Date(y, m, 28).toISOString(),
      eventType: 'maintenance-window',
      description: 'Extended maintenance and data migration',
    },
  ];
}

const FEED_FACTORIES: Record<CalendarFeedId, () => CalendarEvent[]> = {
  learner: makeLearnerEvents,
  staff: makeStaffEvents,
  system: makeSystemEvents,
};

/**
 * Returns placeholder calendar events for a given feed.
 * Drop-in replacement for useCalendarFeed during development.
 */
export function useCalendarFeedPlaceholder(feedId: CalendarFeedId): {
  data: CalendarEvent[];
  isLoading: boolean;
} {
  const data = useMemo(() => FEED_FACTORIES[feedId](), [feedId]);
  return { data, isLoading: false };
}
