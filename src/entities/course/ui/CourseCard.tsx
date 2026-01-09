/**
 * CourseCard Component
 * Displays a course as a card with metadata matching the contract
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { BookOpen, Clock, Users, Award } from 'lucide-react';
import type { CourseListItem } from '../model/types';
import { cn } from '@/shared/lib/utils';

interface CourseCardProps {
  course: CourseListItem;
  className?: string;
  showEnrollmentCount?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  className,
  showEnrollmentCount = true,
}) => {
  const statusColor = getStatusColor(course.status);
  const isPublished = course.status === 'published';

  return (
    <Link to={`/courses/${course.id}`} className="block">
      <Card className={cn('h-full transition-shadow hover:shadow-lg', className)}>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-mono">
                  {course.code}
                </Badge>
                <Badge variant={statusColor}>{course.status}</Badge>
                {isPublished && course.publishedAt && (
                  <Badge variant="secondary" className="text-xs">
                    Published
                  </Badge>
                )}
              </div>
              <CardTitle className="line-clamp-2">{course.title}</CardTitle>
            </div>
          </div>
          {course.description && (
            <CardDescription className="line-clamp-2">{course.description}</CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Department & Program */}
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-medium">Department:</span>
              <span>{course.department.name}</span>
            </div>
            {course.program && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="font-medium">Program:</span>
                <span>{course.program.name}</span>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{course.moduleCount} Modules</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(course.duration)}</span>
            </div>
            {course.credits > 0 && (
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4" />
                <span>{course.credits} Credits</span>
              </div>
            )}
            {showEnrollmentCount && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{course.enrollmentCount} Enrolled</span>
              </div>
            )}
          </div>

          {/* Instructors */}
          {course.instructors.length > 0 && (
            <div className="text-sm">
              <span className="text-muted-foreground">Instructors: </span>
              <span>
                {course.instructors
                  .map((i) => `${i.firstName} ${i.lastName}`)
                  .join(', ')}
              </span>
            </div>
          )}
        </CardContent>

        {course.settings && (
          <CardFooter className="flex flex-wrap gap-2">
            {course.settings.allowSelfEnrollment && (
              <Badge variant="secondary" className="text-xs">
                Self-Enrollment
              </Badge>
            )}
            {course.settings.certificateEnabled && (
              <Badge variant="secondary" className="text-xs">
                Certificate
              </Badge>
            )}
          </CardFooter>
        )}
      </Card>
    </Link>
  );
};

// Helper functions
function getStatusColor(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'published':
      return 'default';
    case 'draft':
      return 'secondary';
    case 'archived':
      return 'outline';
    default:
      return 'default';
  }
}

function formatDuration(hours: number): string {
  if (hours === 0) return 'No duration';
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours % 1 === 0) return `${hours}h`;
  const h = Math.floor(hours);
  const m = Math.round((hours % 1) * 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
