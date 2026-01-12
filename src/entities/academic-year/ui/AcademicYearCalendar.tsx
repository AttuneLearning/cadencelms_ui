/**
 * AcademicYearCalendar Component
 * Visual calendar representation of an academic year with terms
 */

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import type { AcademicYear } from '../model/types';
import {
  format,
  eachMonthOfInterval,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  differenceInDays,
} from 'date-fns';
import { cn } from '@/shared/lib/utils';

interface AcademicYearCalendarProps {
  academicYear: AcademicYear;
  className?: string;
}

export const AcademicYearCalendar: React.FC<AcademicYearCalendarProps> = ({
  academicYear,
  className,
}) => {
  const startDate = new Date(academicYear.startDate);
  const endDate = new Date(academicYear.endDate);
  const months = eachMonthOfInterval({ start: startDate, end: endDate });

  const totalDays = differenceInDays(endDate, startDate) + 1;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Academic Calendar</CardTitle>
          <Badge variant={academicYear.isCurrent ? 'default' : 'secondary'}>
            {academicYear.isCurrent ? 'Current' : academicYear.status}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          {format(startDate, 'MMMM dd, yyyy')} - {format(endDate, 'MMMM dd, yyyy')} ({totalDays}{' '}
          days)
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Timeline */}
        <div className="space-y-4">
          <div className="text-sm font-medium">Academic Year Timeline</div>
          <div className="relative">
            {/* Timeline bar */}
            <div className="h-12 rounded-lg bg-muted border overflow-hidden flex">
              {academicYear.terms?.map((term, index) => {
                const termStart = new Date(term.startDate);
                const termEnd = new Date(term.endDate);
                const termDays = differenceInDays(termEnd, termStart) + 1;
                const widthPercent = (termDays / totalDays) * 100;

                const colors = [
                  'bg-blue-500',
                  'bg-green-500',
                  'bg-purple-500',
                  'bg-orange-500',
                  'bg-pink-500',
                ];
                const color = colors[index % colors.length];

                return (
                  <div
                    key={index}
                    className={cn('flex items-center justify-center text-white text-xs font-medium px-2', color)}
                    style={{ width: `${widthPercent}%` }}
                    title={`${term.name}: ${format(termStart, 'MMM dd')} - ${format(termEnd, 'MMM dd')}`}
                  >
                    <span className="truncate">{term.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Month Grid */}
        <div className="space-y-4">
          <div className="text-sm font-medium">Months</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {months.map((month, index) => {
              const monthStart = startOfMonth(month);
              const monthEnd = endOfMonth(month);

              // Find which terms overlap with this month
              const overlappingTerms = (academicYear.terms || []).filter((term) => {
                const termStart = new Date(term.startDate);
                const termEnd = new Date(term.endDate);
                return (
                  isWithinInterval(monthStart, { start: termStart, end: termEnd }) ||
                  isWithinInterval(monthEnd, { start: termStart, end: termEnd }) ||
                  (monthStart <= termStart && monthEnd >= termEnd)
                );
              });

              return (
                <div
                  key={index}
                  className={cn(
                    'p-3 rounded-lg border text-center space-y-1',
                    overlappingTerms.length > 0 ? 'bg-primary/5 border-primary/20' : 'bg-muted'
                  )}
                >
                  <div className="font-medium text-sm">{format(month, 'MMM')}</div>
                  <div className="text-xs text-muted-foreground">{format(month, 'yyyy')}</div>
                  {overlappingTerms.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center mt-2">
                      {overlappingTerms.slice(0, 2).map((term, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px] px-1 py-0">
                          {term.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Terms Legend */}
        {academicYear.terms && academicYear.terms.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Terms</div>
            <div className="flex flex-wrap gap-2">
              {academicYear.terms.map((term, index) => {
                const colors = [
                  'bg-blue-500',
                  'bg-green-500',
                  'bg-purple-500',
                  'bg-orange-500',
                  'bg-pink-500',
                ];
                const color = colors[index % colors.length];

                return (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className={cn('w-3 h-3 rounded', color)} />
                    <span className="font-medium">{term.name}</span>
                    <span className="text-muted-foreground">
                      ({format(new Date(term.startDate), 'MMM dd')} - {format(new Date(term.endDate), 'MMM dd')})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
