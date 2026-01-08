/**
 * CourseCard Component
 * Displays a course as a card with thumbnail, title, and metadata
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
import { BookOpen, Clock, TrendingUp, Users } from 'lucide-react';
import { Progress as ProgressBar } from '@/shared/ui/progress';
import type { CourseListItem } from '../model/types';
import { cn } from '@/shared/lib/utils';

interface CourseCardProps {
  course: CourseListItem;
  className?: string;
  showProgress?: boolean;
  showEnrollmentCount?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  className,
  showProgress = false,
  showEnrollmentCount = false,
}) => {
  return (
    <Link to={`/courses/${course._id}`} className="block">
      <Card className={cn('h-full transition-shadow hover:shadow-lg', className)}>
        {/* Thumbnail */}
        {course.thumbnail && (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-2">{course.title}</CardTitle>
            {course.level && (
              <Badge variant={getLevelVariant(course.level)}>{course.level}</Badge>
            )}
          </div>
          {course.shortDescription && (
            <CardDescription className="line-clamp-2">
              {course.shortDescription}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Progress Bar (for enrolled courses) */}
          {showProgress && typeof course.progress === 'number' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{course.progress}%</span>
              </div>
              <ProgressBar value={course.progress} className="h-2" />
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {typeof course.lessonCount === 'number' && (
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>
                  {course.lessonCount} {course.lessonCount === 1 ? 'Lesson' : 'Lessons'}
                </span>
              </div>
            )}
            {typeof course.duration === 'number' && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(course.duration)}</span>
              </div>
            )}
            {showEnrollmentCount && typeof course.enrollmentCount === 'number' && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{course.enrollmentCount} Enrolled</span>
              </div>
            )}
          </div>
        </CardContent>

        {course.isEnrolled && (
          <CardFooter>
            <Badge variant="secondary" className="w-full justify-center">
              <TrendingUp className="mr-1 h-3 w-3" />
              Enrolled
            </Badge>
          </CardFooter>
        )}
      </Card>
    </Link>
  );
};

// Helper functions
function getLevelVariant(level: string): 'default' | 'secondary' | 'destructive' {
  switch (level) {
    case 'beginner':
      return 'secondary';
    case 'intermediate':
      return 'default';
    case 'advanced':
      return 'destructive';
    default:
      return 'default';
  }
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
