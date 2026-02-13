/**
 * CalendarWidget — Top-level composition component
 *
 * Pure presentation: accepts CalendarFeed[] and CalendarState,
 * renders the month grid with span bar overlay and sidebar.
 */

import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import type { CalendarFeed, CalendarFeedId } from '@/entities/calendar-event';
import { CalendarMonthNav } from './ui/CalendarMonthNav';
import { CalendarGrid } from './ui/CalendarGrid';
import { CalendarSidebar } from './ui/CalendarSidebar';

interface CalendarWidgetProps {
  currentMonth: Date;
  selectedDay: Date | null;
  feeds: CalendarFeed[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onSelectDay: (day: Date) => void;
  onToggleFeed: (feedId: CalendarFeedId) => void;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  currentMonth,
  selectedDay,
  feeds,
  onPrevMonth,
  onNextMonth,
  onToday,
  onSelectDay,
  onToggleFeed,
}) => {
  const isLoading = feeds.some((f) => f.enabled && f.isLoading);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      {/* Calendar grid */}
      <Card>
        <CardContent className="pt-6">
          <CalendarMonthNav
            currentMonth={currentMonth}
            onPrev={onPrevMonth}
            onNext={onNextMonth}
            onToday={onToday}
          />

          {isLoading ? (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              Loading...
            </div>
          ) : (
            <CalendarGrid
              currentMonth={currentMonth}
              selectedDay={selectedDay}
              feeds={feeds}
              onSelectDay={onSelectDay}
            />
          )}
        </CardContent>
      </Card>

      {/* Sidebar */}
      <CalendarSidebar
        feeds={feeds}
        selectedDay={selectedDay}
        onToggleFeed={onToggleFeed}
      />
    </div>
  );
};
