/**
 * Staff Calendar Page (ISS-014 / UI-ISS-127)
 * Month-view calendar for staff showing class sessions, office hours, and meetings
 */

import React, { useMemo, useState } from 'react';
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

type StaffEventType = 'class-session' | 'office-hours' | 'meeting';

interface StaffCalendarEvent {
  id: string;
  title: string;
  date: string; // ISO date string
  time: string; // e.g. "9:00 AM - 10:30 AM"
  type: StaffEventType;
  location?: string;
}

// ---------------------------------------------------------------------------
// Hook — placeholder data until a real API is available
// ---------------------------------------------------------------------------

function useStaffCalendarEvents(_month: Date): { data: StaffCalendarEvent[]; isLoading: boolean } {
  const data = useMemo<StaffCalendarEvent[]>(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();

    return [
      {
        id: '1',
        title: 'Safety Fundamentals — Section A',
        date: new Date(y, m, 3).toISOString(),
        time: '9:00 AM - 10:30 AM',
        type: 'class-session',
        location: 'Room 201',
      },
      {
        id: '2',
        title: 'Safety Fundamentals — Section B',
        date: new Date(y, m, 5).toISOString(),
        time: '1:00 PM - 2:30 PM',
        type: 'class-session',
        location: 'Room 201',
      },
      {
        id: '3',
        title: 'Office Hours',
        date: new Date(y, m, 7).toISOString(),
        time: '3:00 PM - 4:00 PM',
        type: 'office-hours',
        location: 'Office 105',
      },
      {
        id: '4',
        title: 'Department Meeting',
        date: new Date(y, m, 10).toISOString(),
        time: '11:00 AM - 12:00 PM',
        type: 'meeting',
        location: 'Conference Room A',
      },
      {
        id: '5',
        title: 'Compliance 101 — Section A',
        date: new Date(y, m, 12).toISOString(),
        time: '9:00 AM - 10:30 AM',
        type: 'class-session',
        location: 'Room 305',
      },
      {
        id: '6',
        title: 'Office Hours',
        date: new Date(y, m, 14).toISOString(),
        time: '3:00 PM - 4:00 PM',
        type: 'office-hours',
        location: 'Office 105',
      },
      {
        id: '7',
        title: 'Curriculum Review',
        date: new Date(y, m, 18).toISOString(),
        time: '2:00 PM - 3:00 PM',
        type: 'meeting',
      },
      {
        id: '8',
        title: 'Safety Fundamentals — Section A',
        date: new Date(y, m, 20).toISOString(),
        time: '9:00 AM - 10:30 AM',
        type: 'class-session',
        location: 'Room 201',
      },
      {
        id: '9',
        title: 'Office Hours',
        date: new Date(y, m, 21).toISOString(),
        time: '3:00 PM - 4:00 PM',
        type: 'office-hours',
        location: 'Office 105',
      },
      {
        id: '10',
        title: 'Safety Fundamentals — Section B',
        date: new Date(y, m, 24).toISOString(),
        time: '1:00 PM - 2:30 PM',
        type: 'class-session',
        location: 'Room 201',
      },
    ];
  }, []);

  return { data, isLoading: false };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const EVENT_COLORS: Record<StaffEventType, string> = {
  'class-session': 'bg-primary/80 text-primary-foreground',
  'office-hours': 'bg-secondary text-secondary-foreground',
  meeting: 'bg-orange-500/80 text-white dark:bg-orange-600/80',
};

const EVENT_DOT_COLORS: Record<StaffEventType, string> = {
  'class-session': 'bg-primary',
  'office-hours': 'bg-secondary-foreground/60',
  meeting: 'bg-orange-500 dark:bg-orange-600',
};

function buildCalendarDays(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end });
}

function eventsForDay(events: StaffCalendarEvent[], day: Date): StaffCalendarEvent[] {
  return events.filter((e) => isSameDay(new Date(e.date), day));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const StaffCalendarPage: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const { data: events, isLoading } = useStaffCalendarEvents(currentMonth);
  const days = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);

  const selectedDayEvents = selectedDay ? eventsForDay(events, selectedDay) : [];

  return (
    <div className="space-y-6 p-8">
      <PageHeader
        title="My Calendar"
        description="Your teaching schedule, meetings, and important dates"
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
                      <div
                        className={`rounded-md px-3 py-2 text-xs font-medium ${EVENT_COLORS[evt.type]}`}
                      >
                        <div>{evt.title}</div>
                        <div className="mt-1 opacity-80">{evt.time}</div>
                        {evt.location && (
                          <div className="mt-0.5 opacity-70">{evt.location}</div>
                        )}
                      </div>
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
                <Badge className="h-5 bg-primary/80 text-primary-foreground">Class</Badge>
                <span className="text-muted-foreground">Class session</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="secondary" className="h-5">Office Hrs</Badge>
                <span className="text-muted-foreground">Office hours</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Badge className="h-5 bg-orange-500/80 text-white dark:bg-orange-600/80">Meeting</Badge>
                <span className="text-muted-foreground">Meeting</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
