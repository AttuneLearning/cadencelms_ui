/**
 * Learner Calendar Page
 * Thin wrapper: learner feed only → CalendarWidget
 */

import React, { useMemo } from 'react';
import { PageHeader } from '@/shared/ui/page-header';
import type { CalendarFeed, CalendarFeedConfig } from '@/entities/calendar-event';
import { useCalendarFeed, getVisibleRange } from '@/entities/calendar-event';
import { CalendarWidget, useCalendarState } from '@/widgets/calendar';

const FEED_CONFIGS: CalendarFeedConfig[] = [
  { id: 'learner', label: 'My Events', color: 'primary' },
];

export const LearnerCalendarPage: React.FC = () => {
  const state = useCalendarState(FEED_CONFIGS.map((f) => f.id));
  const filters = useMemo(() => getVisibleRange(state.currentMonth), [state.currentMonth]);
  const learnerFeed = useCalendarFeed('learner', filters);

  const feeds = useMemo<CalendarFeed[]>(
    () =>
      FEED_CONFIGS.map((config) => ({
        ...config,
        enabled: state.enabledFeeds.has(config.id),
        isLoading: learnerFeed.isLoading,
        events: learnerFeed.data?.events ?? [],
      })),
    [state.enabledFeeds, learnerFeed.data, learnerFeed.isLoading]
  );

  return (
    <div className="space-y-6 p-8">
      <PageHeader
        title="My Calendar"
        description="Enrollment dates, deadlines, and upcoming events"
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
