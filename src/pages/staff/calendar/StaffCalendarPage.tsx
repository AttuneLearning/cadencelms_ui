/**
 * Staff Calendar Page
 * Thin wrapper: staff + learner feeds → CalendarWidget
 */

import React, { useMemo } from 'react';
import { PageHeader } from '@/shared/ui/page-header';
import type { CalendarFeed, CalendarFeedConfig } from '@/entities/calendar-event';
import { useCalendarFeed, getVisibleRange } from '@/entities/calendar-event';
import { CalendarWidget, useCalendarState } from '@/widgets/calendar';

const FEED_CONFIGS: CalendarFeedConfig[] = [
  { id: 'staff', label: 'Teaching', color: 'violet' },
  { id: 'learner', label: 'My Learning', color: 'primary' },
];

export const StaffCalendarPage: React.FC = () => {
  const state = useCalendarState(FEED_CONFIGS.map((f) => f.id));
  const filters = useMemo(() => getVisibleRange(state.currentMonth), [state.currentMonth]);
  const staffFeed = useCalendarFeed('staff', filters);
  const learnerFeed = useCalendarFeed('learner', filters);

  const feedDataMap = useMemo(
    () => ({
      staff: staffFeed,
      learner: learnerFeed,
    }),
    [staffFeed, learnerFeed]
  );

  const feeds = useMemo<CalendarFeed[]>(
    () =>
      FEED_CONFIGS.map((config) => {
        const feedData = feedDataMap[config.id as keyof typeof feedDataMap];
        return {
          ...config,
          enabled: state.enabledFeeds.has(config.id),
          isLoading: feedData?.isLoading ?? false,
          events: feedData?.data?.events ?? [],
        };
      }),
    [state.enabledFeeds, feedDataMap]
  );

  return (
    <div className="space-y-6 p-8">
      <PageHeader
        title="My Calendar"
        description="Your teaching schedule, meetings, and important dates"
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
