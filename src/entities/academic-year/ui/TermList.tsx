/**
 * TermList Component
 * Displays a list of terms for an academic year
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Calendar, Clock, BookOpen } from 'lucide-react';
import type { Term, TermListItem } from '../model/types';
import { format, differenceInDays, isWithinInterval } from 'date-fns';
import { cn } from '@/shared/lib/utils';

interface TermListProps {
  terms: Term[] | TermListItem[];
  className?: string;
  variant?: 'grid' | 'list';
  emptyMessage?: string;
  onTermClick?: (term: Term | TermListItem) => void;
}

const getTermTypeColor = (termType: string) => {
  switch (termType) {
    case 'fall':
      return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'spring':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'summer':
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'winter':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    default:
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
};

const getTermTypeLabel = (termType: string) => {
  return termType.charAt(0).toUpperCase() + termType.slice(1);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'future':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'past':
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    default:
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
};

export const TermList: React.FC<TermListProps> = ({
  terms,
  className,
  variant = 'grid',
  emptyMessage = 'No terms defined',
  onTermClick,
}) => {
  if (terms.length === 0) {
    return (
      <div className="flex min-h-[100px] items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  const now = new Date();

  return (
    <div
      className={cn(
        variant === 'grid'
          ? 'grid grid-cols-1 gap-4 md:grid-cols-2'
          : 'flex flex-col gap-4',
        className
      )}
    >
      {terms.map((term) => {
        const startDate = new Date(term.startDate);
        const endDate = new Date(term.endDate);
        const duration = differenceInDays(endDate, startDate) + 1;
        const isCurrent = isWithinInterval(now, { start: startDate, end: endDate });

        const CardWrapper = onTermClick ? 'div' : 'div';

        return (
          <CardWrapper
            key={term.id}
            onClick={() => onTermClick?.(term)}
            className={onTermClick ? 'cursor-pointer' : undefined}
          >
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{term.name}</CardTitle>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {term.academicYear.name}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge
                      variant="outline"
                      className={cn('text-xs whitespace-nowrap', getTermTypeColor(term.termType))}
                    >
                      {getTermTypeLabel(term.termType)}
                    </Badge>
                    {isCurrent && (
                      <Badge variant="default" className="text-xs whitespace-nowrap">
                        Current
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">
                      {format(startDate, 'MMM dd, yyyy')} - {format(endDate, 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span>
                      {duration} {duration === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-4 w-4 flex-shrink-0" />
                    <span>
                      {term.classCount} {term.classCount === 1 ? 'class' : 'classes'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn('text-xs', getStatusColor(term.status))}
                  >
                    {term.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </CardWrapper>
        );
      })}
    </div>
  );
};
