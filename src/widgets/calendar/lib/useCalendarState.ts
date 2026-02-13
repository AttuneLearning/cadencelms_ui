/**
 * Calendar widget local state hook
 * Manages currentMonth, selectedDay, enabledFeeds, and navigation
 */

import { useCallback, useState } from 'react';
import { startOfMonth, addMonths, subMonths } from 'date-fns';
import type { CalendarFeedId } from '@/entities/calendar-event';

export interface CalendarState {
  currentMonth: Date;
  selectedDay: Date | null;
  enabledFeeds: Set<CalendarFeedId>;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  goToToday: () => void;
  selectDay: (day: Date) => void;
  toggleFeed: (feedId: CalendarFeedId) => void;
}

export function useCalendarState(
  initialFeeds: CalendarFeedId[]
): CalendarState {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [enabledFeeds, setEnabledFeeds] = useState(() => new Set(initialFeeds));

  const goToPrevMonth = useCallback(() => {
    setCurrentMonth((m) => subMonths(m, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth((m) => addMonths(m, 1));
  }, []);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentMonth(startOfMonth(today));
    setSelectedDay(today);
  }, []);

  const selectDay = useCallback((day: Date) => {
    setSelectedDay(day);
  }, []);

  const toggleFeed = useCallback((feedId: CalendarFeedId) => {
    setEnabledFeeds((prev) => {
      const next = new Set(prev);
      if (next.has(feedId)) {
        next.delete(feedId);
      } else {
        next.add(feedId);
      }
      return next;
    });
  }, []);

  return {
    currentMonth,
    selectedDay,
    enabledFeeds,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
    selectDay,
    toggleFeed,
  };
}
