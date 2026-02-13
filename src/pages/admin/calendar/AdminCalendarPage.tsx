/**
 * Admin Calendar Page
 * Thin wrapper: system feed only → CalendarWidget
 */

import React, { useMemo } from 'react';
import { PageHeader } from '@/shared/ui/page-header';
import type { CalendarFeed, CalendarFeedConfig } from '@/entities/calendar-event';
import { useCalendarFeed, getVisibleRange } from '@/entities/calendar-event';
import { CalendarWidget, useCalendarState } from '@/widgets/calendar';

const FEED_CONFIGS: CalendarFeedConfig[] = [
  { id: 'system', label: 'System Events', color: 'orange' },
];

export const AdminCalendarPage: React.FC = () => {
  const state = useCalendarState(FEED_CONFIGS.map((f) => f.id));
  const filters = useMemo(() => getVisibleRange(state.currentMonth), [state.currentMonth]);
  const systemFeed = useCalendarFeed('system', filters);

  const feeds = useMemo<CalendarFeed[]>(
    () =>
      FEED_CONFIGS.map((config) => ({
        ...config,
        enabled: state.enabledFeeds.has(config.id),
        isLoading: systemFeed.isLoading,
        events: systemFeed.data?.events ?? [],
      })),
    [state.enabledFeeds, systemFeed.data, systemFeed.isLoading]
  );

  return (
    <div className="space-y-6 p-8">
      <PageHeader
        title="System Calendar"
        description="System-wide calendar of events, academic dates, and department activities"
      />
      <CalendarWidget
        currentMonth={state.currentMonth}
        selectedDay={state.selectedDay}
        feeds={feeds}
        onPrevMonth={state.goToPrevMonth}
        onNextMonth={state.goToNextMonth}
        onToday={state.goToToday}
        onSelectDay={state.selectDay}
        onToggleFeed={state.toggleFeed}
      />
    </div>
  );
};
