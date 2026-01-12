/**
 * ClassCard Component
 * Displays a class (course instance) as a card
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { CalendarDays, Clock, Users, User, Building } from 'lucide-react';
import type { ClassListItem } from '../model/types';
import { cn } from '@/shared/lib/utils';

interface ClassCardProps {
  classItem: ClassListItem;
  className?: string;
  showDepartment?: boolean;
  showProgram?: boolean;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  classItem,
  className,
  showDepartment = true,
  showProgram = true,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'upcoming':
        return 'secondary';
      case 'completed':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const primaryInstructor = classItem.instructors.find((i) => i.role === 'primary');
  const enrollmentPercent = classItem.capacity
    ? Math.round((classItem.enrolledCount / classItem.capacity) * 100)
    : 0;

  return (
    <Link to={`/classes/${classItem.id}`} className="block">
      <Card className={cn('h-full transition-shadow hover:shadow-lg', className)}>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-1">
              <CardTitle className="line-clamp-2">{classItem.name}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                {classItem.course.code} - {classItem.course.title}
              </CardDescription>
            </div>
            <Badge variant={getStatusVariant(classItem.status)}>{classItem.status}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Program and Term */}
          {showProgram && (
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building className="h-4 w-4" />
                <span>{classItem.program.name}</span>
              </div>
              {classItem.academicTerm && (
                <div className="ml-6 text-xs text-muted-foreground">
                  {classItem.academicTerm.name}
                </div>
              )}
            </div>
          )}

          {/* Instructor */}
          {primaryInstructor && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>
                {primaryInstructor.firstName} {primaryInstructor.lastName}
              </span>
            </div>
          )}

          {/* Dates */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>
              {formatDate(classItem.startDate)} - {formatDate(classItem.endDate)}
            </span>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{classItem.duration} weeks</span>
          </div>

          {/* Enrollment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Enrollment</span>
              </div>
              <span className="font-medium">
                {classItem.enrolledCount}
                {classItem.capacity && ` / ${classItem.capacity}`}
              </span>
            </div>
            {classItem.capacity && (
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn(
                    'h-full transition-all',
                    enrollmentPercent >= 100
                      ? 'bg-destructive'
                      : enrollmentPercent >= 80
                      ? 'bg-yellow-500'
                      : 'bg-primary'
                  )}
                  style={{ width: `${Math.min(enrollmentPercent, 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Department */}
          {showDepartment && (
            <div className="text-xs text-muted-foreground">
              Department: {classItem.department.name}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};
