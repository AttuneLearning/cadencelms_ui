/**
 * AcademicYearCard Component
 * Displays an academic year as a card with status, dates, and term count
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import type { AcademicYearListItem } from '../model/types';
import { cn } from '@/shared/lib/utils';
import { format } from 'date-fns';

interface AcademicYearCardProps {
  academicYear: AcademicYearListItem;
  className?: string;
  onClick?: () => void;
}

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

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'future':
      return 'Future';
    case 'past':
      return 'Past';
    default:
      return status;
  }
};

export const AcademicYearCard: React.FC<AcademicYearCardProps> = ({
  academicYear,
  className,
  onClick,
}) => {
  const cardContent = (
    <Card className={cn('h-full transition-shadow hover:shadow-lg', className)}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg truncate">{academicYear.name}</CardTitle>
                {academicYear.isCurrent && (
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant="outline"
                  className={cn('text-xs', getStatusColor(academicYear.status))}
                >
                  {getStatusLabel(academicYear.status)}
                </Badge>
                {academicYear.isCurrent && (
                  <Badge variant="default" className="text-xs">
                    Current Year
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {format(new Date(academicYear.startDate), 'MMM dd, yyyy')} -{' '}
              {format(new Date(academicYear.endDate), 'MMM dd, yyyy')}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>
              {academicYear.termCount} {academicYear.termCount === 1 ? 'Term' : 'Terms'}
            </span>
          </div>
        </CardContent>
      </Card>
  );

  if (onClick) {
    return (
      <div onClick={onClick} className="cursor-pointer">
        {cardContent}
      </div>
    );
  }

  return (
    <Link to={`/admin/academic-years/${academicYear.id}`}>
      {cardContent}
    </Link>
  );
};
