/**
 * Schedules List Component
 * Displays a grid of report schedules
 */

import React from 'react';
import type { ReportSchedule } from '@/entities/report-schedule';
import { ScheduleCard } from './ScheduleCard';
import { cn } from '@/shared/lib/utils';

interface SchedulesListProps {
  schedules: ReportSchedule[];
  onTrigger?: (scheduleId: string) => void;
  onToggle?: (scheduleId: string, active: boolean) => void;
  onView?: (scheduleId: string) => void;
  emptyMessage?: string;
  className?: string;
}

export const SchedulesList: React.FC<SchedulesListProps> = ({
  schedules,
  onTrigger,
  onToggle,
  onView,
  emptyMessage = 'No schedules found',
  className,
}) => {
  if (schedules.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
        className
      )}
    >
      {schedules.map((schedule) => (
        <ScheduleCard
          key={schedule._id}
          schedule={schedule}
          onTrigger={onTrigger}
          onToggle={onToggle}
          onView={onView}
        />
      ))}
    </div>
  );
};
