/**
 * EnrollmentCard Component
 * Displays an enrollment with course details and progress
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
import { Progress } from '@/shared/ui/progress';
import { Button } from '@/shared/ui/button';
import {
  BookOpen,
  Clock,
  TrendingUp,
  Award,
  Calendar,
  PlayCircle,
  AlertCircle,
} from 'lucide-react';
import type { EnrollmentWithCourse } from '../model/types';
import { cn } from '@/shared/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface EnrollmentCardProps {
  enrollment: EnrollmentWithCourse;
  className?: string;
  showProgress?: boolean;
  onContinue?: (enrollmentId: string, courseId: string) => void;
}

export const EnrollmentCard: React.FC<EnrollmentCardProps> = ({
  enrollment,
  className,
  showProgress = true,
  onContinue,
}) => {
  const { course } = enrollment;

  return (
    <Card className={cn('h-full transition-shadow hover:shadow-lg', className)}>
      {/* Course Thumbnail */}
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
          <div className="flex-1">
            <CardTitle className="line-clamp-2">{course.title}</CardTitle>
            {course.shortDescription && (
              <CardDescription className="mt-2 line-clamp-2">
                {course.shortDescription}
              </CardDescription>
            )}
          </div>
          <Badge variant={getStatusVariant(enrollment.status)}>
            {getStatusLabel(enrollment.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        {showProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>Progress</span>
              </div>
              <span className="font-medium">{enrollment.progress}%</span>
            </div>
            <Progress value={enrollment.progress} className="h-2" />
          </div>
        )}

        {/* Course Metadata */}
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
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
          {course.level && (
            <Badge variant="outline" className="text-xs">
              {course.level}
            </Badge>
          )}
        </div>

        {/* Enrollment Info */}
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Enrolled {formatDistanceToNow(new Date(enrollment.enrolledAt), { addSuffix: true })}</span>
          </div>
          {enrollment.lastAccessedAt && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                Last accessed {formatDistanceToNow(new Date(enrollment.lastAccessedAt), { addSuffix: true })}
              </span>
            </div>
          )}
          {enrollment.expiresAt && new Date(enrollment.expiresAt) > new Date() && (
            <div className="flex items-center gap-1 text-orange-600">
              <AlertCircle className="h-3 w-3" />
              <span>
                Expires {formatDistanceToNow(new Date(enrollment.expiresAt), { addSuffix: true })}
              </span>
            </div>
          )}
        </div>

        {/* Certificate Badge */}
        {enrollment.isCertificateIssued && (
          <Badge variant="secondary" className="w-full justify-center">
            <Award className="mr-1 h-3 w-3" />
            Certificate Earned
          </Badge>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        <Link to={`/courses/${course._id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            View Course
          </Button>
        </Link>
        {enrollment.status === 'active' && (
          <Button
            onClick={() => onContinue?.(enrollment._id, course._id)}
            className="flex-1"
          >
            <PlayCircle className="mr-2 h-4 w-4" />
            Continue
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

// Helper functions
function getStatusVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'active':
      return 'default';
    case 'completed':
      return 'secondary';
    case 'dropped':
      return 'destructive';
    case 'expired':
      return 'outline';
    default:
      return 'default';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'active':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'dropped':
      return 'Dropped';
    case 'expired':
      return 'Expired';
    default:
      return status;
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
