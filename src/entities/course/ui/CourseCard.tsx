/**
 * CourseCard component
 * Displays a course in a card format
 */

import * as React from 'react';
import { Clock, BookOpen, User, TrendingUp } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { cn } from '@/shared/lib/utils';
import type { Course } from '../model/types';

export interface CourseCardProps extends React.HTMLAttributes<HTMLDivElement> {
  course: Course;
  onEnroll?: (courseId: string) => void;
  onView?: (courseId: string) => void;
  showProgress?: boolean;
  showEnrollButton?: boolean;
}

/**
 * Format duration in minutes to human readable format
 */
function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

/**
 * Get initials from name
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Get badge variant for course difficulty
 */
function getDifficultyVariant(
  difficulty: string
): 'default' | 'secondary' | 'outline' {
  switch (difficulty) {
    case 'beginner':
      return 'secondary';
    case 'intermediate':
      return 'default';
    case 'advanced':
      return 'outline';
    default:
      return 'default';
  }
}

/**
 * CourseCard component
 */
export const CourseCard = React.forwardRef<HTMLDivElement, CourseCardProps>(
  (
    {
      course,
      onEnroll,
      onView,
      showProgress = false,
      showEnrollButton = false,
      className,
      ...props
    },
    ref
  ) => {
    const handleCardClick = () => {
      if (onView) {
        onView(course.id);
      }
    };

    const handleEnrollClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onEnroll) {
        onEnroll(course.id);
      }
    };

    return (
      <Card
        ref={ref}
        className={cn(
          'group cursor-pointer transition-all hover:shadow-lg',
          className
        )}
        onClick={handleCardClick}
        role="article"
        aria-label={`Course: ${course.title}`}
        {...props}
      >
        {/* Thumbnail */}
        {course.thumbnail && (
          <div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-muted">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
            {course.isEnrolled && (
              <Badge className="absolute right-2 top-2" variant="default">
                Enrolled
              </Badge>
            )}
            {!course.thumbnail && (
              <div className="flex h-full items-center justify-center">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>
        )}

        <CardHeader>
          <div className="mb-2 flex items-center justify-between gap-2">
            <Badge variant={getDifficultyVariant(course.metadata.skillLevel)}>
              {course.metadata.skillLevel}
            </Badge>
            <Badge variant="outline">{course.category.name}</Badge>
          </div>

          <CardTitle className="line-clamp-2 text-xl">{course.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {course.description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Course Metadata */}
          <div className="mb-4 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(course.metadata.duration)}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{course.metadata.lessonsCount} lessons</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{course.stats.totalEnrollments} enrolled</span>
            </div>
            {course.stats.averageRating && (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                <span>{course.stats.averageRating.toFixed(1)} rating</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {showProgress && course.progress !== undefined && (
            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{course.progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${course.progress}%` }}
                  role="progressbar"
                  aria-valuenow={course.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          )}

          {/* Instructor */}
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={course.instructor.avatar}
                alt={course.instructor.name}
              />
              <AvatarFallback>
                {getInitials(course.instructor.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {course.instructor.name}
              </p>
              {course.instructor.title && (
                <p className="truncate text-xs text-muted-foreground">
                  {course.instructor.title}
                </p>
              )}
            </div>
          </div>
        </CardContent>

        {showEnrollButton && !course.isEnrolled && (
          <CardFooter>
            <button
              onClick={handleEnrollClick}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label={`Enroll in ${course.title}`}
            >
              Enroll Now
            </button>
          </CardFooter>
        )}
      </Card>
    );
  }
);

CourseCard.displayName = 'CourseCard';
