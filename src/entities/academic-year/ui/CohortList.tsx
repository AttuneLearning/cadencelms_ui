/**
 * CohortList Component
 * Displays a list of cohorts (year groups/graduating classes)
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Calendar, Users, GraduationCap, Building } from 'lucide-react';
import type { Cohort, CohortListItem } from '../model/types';
import { cn } from '@/shared/lib/utils';

interface CohortListProps {
  cohorts: Cohort[] | CohortListItem[];
  className?: string;
  variant?: 'grid' | 'list';
  emptyMessage?: string;
  onCohortClick?: (cohort: Cohort | CohortListItem) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'graduated':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'inactive':
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    default:
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
};

const getStatusLabel = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export const CohortList: React.FC<CohortListProps> = ({
  cohorts,
  className,
  variant = 'grid',
  emptyMessage = 'No cohorts found',
  onCohortClick,
}) => {
  if (cohorts.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        variant === 'grid'
          ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
          : 'flex flex-col gap-4',
        className
      )}
    >
      {cohorts.map((cohort) => {
        const CardWrapper = onCohortClick ? 'div' : 'div';

        return (
          <CardWrapper
            key={cohort.id}
            onClick={() => onCohortClick?.(cohort)}
            className={onCohortClick ? 'cursor-pointer' : undefined}
          >
            <Card className="h-full transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{cohort.name}</CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-2">
                      <span className="truncate">{cohort.program.name}</span>
                    </CardDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {cohort.code}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn('text-xs', getStatusColor(cohort.status))}
                      >
                        {getStatusLabel(cohort.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  {cohort.level && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GraduationCap className="h-4 w-4 flex-shrink-0" />
                      <span>{cohort.level}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>
                      {cohort.startYear} - {cohort.endYear}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4 flex-shrink-0" />
                    <span>
                      {cohort.learnerCount} {cohort.learnerCount === 1 ? 'learner' : 'learners'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{cohort.academicYear.name}</span>
                  </div>
                </div>

                {cohort.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {cohort.description}
                  </p>
                )}
              </CardContent>
            </Card>
          </CardWrapper>
        );
      })}
    </div>
  );
};
