/**
 * CalendarWeekdayHeader — Sun–Sat header row
 */

import React from 'react';
import { WEEKDAY_LABELS } from '@/entities/calendar-event';

export const CalendarWeekdayHeader: React.FC = () => (
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
);
