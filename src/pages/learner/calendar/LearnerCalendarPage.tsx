/**
 * Learner Calendar Page (UI-ISS-125)
 * Month-view calendar showing enrollment dates and deadlines
 */

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { PageHeader } from '@/shared/ui/page-header';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CalendarEventType = 'enrollment-start' | 'enrollment-expiry' | 'deadline';

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO date string
  type: CalendarEventType;
  link?: string;
}

// ---------------------------------------------------------------------------
// Hook — placeholder data until a real API is available
// ---------------------------------------------------------------------------

function useCalendarEvents(_month: Date): { data: CalendarEvent[]; isLoading: boolean } {
  const data = useMemo<CalendarEvent[]>(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();

    return [
      {
        id: '1',
        title: 'Safety Fundamentals — enrolled',
        date: new Date(y, m, 3).toISOString(),
        type: 'enrollment-start',
        link: '/learner/courses',
      },
      {
        id: '2',
        title: 'Safety Fundamentals — expires',
        date: new Date(y, m, 28).toISOString(),
        type: 'enrollment-expiry',
        link: '/learner/courses',
      },
      {
        id: '3',
        title: 'Module 2 Assignment due',
        date: new Date(y, m, 15).toISOString(),
        type: 'deadline',
        link: '/learner/courses',
      },
      {
        id: '4',
        title: 'Compliance 101 — enrolled',
        date: new Date(y, m, 1).toISOString(),
        type: 'enrollment-start',
        link: '/learner/courses',
      },
      {
        id: '5',
        title: 'Compliance 101 — expires',
        date: new Date(y, m + 1, 10).toISOString(),
        type: 'enrollment-expiry',
        link: '/learner/courses',
      },
    ];
  }, []);

  return { data, isLoading: false };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const EVENT_COLORS: Record<CalendarEventType, string> = {
  'enrollment-start': 'bg-primary/80 text-primary-foreground',
  'enrollment-expiry': 'bg-destructive/80 text-destructive-foreground',
  deadline: 'bg-orange-500/80 text-white dark:bg-orange-600/80',
};

const EVENT_DOT_COLORS: Record<CalendarEventType, string> = {
  'enrollment-start': 'bg-primary',
  'enrollment-expiry': 'bg-destructive',
  deadline: 'bg-orange-500 dark:bg-orange-600',
};

function buildCalendarDays(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end });
}

function eventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return events.filter((e) => isSameDay(new Date(e.date), day));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const LearnerCalendarPage: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const navigate = useNavigate();

  const { data: events, isLoading } = useCalendarEvents(currentMonth);
  const days = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);

  const selectedDayEvents = selectedDay ? eventsForDay(events, selectedDay) : [];

  return (
    <div className="space-y-6 p-8">
      <PageHeader
        title="My Calendar"
        description="Enrollment dates, deadlines, and upcoming events"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Calendar grid */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">
              {format(currentMonth, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => {
                  const today = new Date();
                  setCurrentMonth(startOfMonth(today));
                  setSelectedDay(today);
                }}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                Loading...
              </div>
            ) : (
              <>
                {/* Weekday headers */}
                <div className="mb-1 grid grid-cols-7">
                  {WEEKDAY_LABELS.map((label) => (
                    <div
                      key={label}
                      className="py-2 text-center text-xs font-medium text-muted-foreground"
                    >
                      {label}
                    </div>
                  ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7">
                  {days.map((day) => {
                    const inMonth = isSameMonth(day, currentMonth);
                    const today = isToday(day);
                    const selected = selectedDay ? isSameDay(day, selectedDay) : false;
                    const dayEvents = eventsForDay(events, day);

                    return (
                      <button
                        key={day.toISOString()}
                        type="button"
                        onClick={() => setSelectedDay(day)}
                        className={`relative flex min-h-[72px] flex-col items-start border border-border/40 p-1.5 text-left transition-colors hover:bg-accent/50 ${
                          !inMonth ? 'bg-muted/30 text-muted-foreground/50' : 'bg-background'
                        } ${selected ? 'ring-2 ring-primary ring-inset' : ''}`}
                      >
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                            today
                              ? 'bg-primary text-primary-foreground'
                              : ''
                          }`}
                        >
                          {format(day, 'd')}
                        </span>

                        {/* Event dots */}
                        {dayEvents.length > 0 && (
                          <div className="mt-0.5 flex flex-wrap gap-0.5">
                            {dayEvents.slice(0, 3).map((evt) => (
                              <span
                                key={evt.id}
                                className={`h-1.5 w-1.5 rounded-full ${EVENT_DOT_COLORS[evt.type]}`}
                                title={evt.title}
                              />
                            ))}
                            {dayEvents.length > 3 && (
                              <span className="text-[10px] leading-none text-muted-foreground">
                                +{dayEvents.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Sidebar — selected day events or legend */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                {selectedDay ? format(selectedDay, 'EEEE, MMMM d') : 'Select a day'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedDay && (
                <p className="text-sm text-muted-foreground">
                  Click a day on the calendar to see its events.
                </p>
              )}

              {selectedDay && selectedDayEvents.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
                  <CalendarDays className="h-8 w-8 opacity-40" />
                  <p className="text-sm">No events on this day</p>
                </div>
              )}

              {selectedDayEvents.length > 0 && (
                <ul className="space-y-2">
                  {selectedDayEvents.map((evt) => (
                    <li key={evt.id}>
                      <button
                        type="button"
                        className={`w-full rounded-md px-3 py-2 text-left text-xs font-medium ${EVENT_COLORS[evt.type]} transition-opacity hover:opacity-90`}
                        onClick={() => evt.link && navigate(evt.link)}
                      >
                        {evt.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <Badge className="h-5 bg-primary/80 text-primary-foreground">Enrolled</Badge>
                <span className="text-muted-foreground">Enrollment start</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Badge className="h-5 bg-destructive/80 text-destructive-foreground">Expiry</Badge>
                <span className="text-muted-foreground">Enrollment expiry</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Badge className="h-5 bg-orange-500/80 text-white dark:bg-orange-600/80">Deadline</Badge>
                <span className="text-muted-foreground">Assignment deadline</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
