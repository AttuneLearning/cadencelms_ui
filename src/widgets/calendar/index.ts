/**
 * Calendar Widget
 * Public API for the shared calendar widget
 */

export { CalendarWidget } from './CalendarWidget';
export { useCalendarState } from './lib/useCalendarState';
export type { CalendarState } from './lib/useCalendarState';
export { assignLanes, lanesUsed } from './lib/spanLayout';
export type { LaneAssignment, WeekSpanLayout } from './lib/spanLayout';
