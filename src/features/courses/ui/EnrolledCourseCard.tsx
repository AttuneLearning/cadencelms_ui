/**
 * EnrolledCourseCard Component
 * Card displaying enrolled course with progress
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { PlayCircle, Clock, Calendar } from 'lucide-react';
import type { EnrollmentListItem } from '@/entities/enrollment';
import { formatDistanceToNow } from 'date-fns';

interface EnrolledCourseCardProps {
  enrollment: EnrollmentListItem;
}

export const EnrolledCourseCard: React.FC<EnrolledCourseCardProps> = ({ enrollment }) => {
  const getStatusBadge = () => {
    if (enrollment.status === 'completed') {
      return <Badge variant="default">Completed</Badge>;
    }
    if (enrollment.progress.percentage === 0) {
      return <Badge variant="secondary">Not Started</Badge>;
    }
    return <Badge variant="outline">In Progress</Badge>;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <Link
              to={`/learner/courses/${enrollment.target.id}/player`}
              className="hover:underline"
            >
              <h3 className="font-semibold text-lg line-clamp-2">
                {enrollment.target.name}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground mt-1">
              {enrollment.target.code}
            </p>
          </div>
          {getStatusBadge()}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{enrollment.progress.percentage}%</span>
          </div>
          <Progress value={enrollment.progress.percentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {enrollment.progress.completedItems} of {enrollment.progress.totalItems} items completed
          </p>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>
              Enrolled {formatDistanceToNow(new Date(enrollment.enrolledAt), { addSuffix: true })}
            </span>
          </div>
          {enrollment.progress.lastActivityAt && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>
                Last activity {formatDistanceToNow(new Date(enrollment.progress.lastActivityAt), { addSuffix: true })}
              </span>
            </div>
          )}
        </div>

        {/* Grade for completed courses */}
        {enrollment.status === 'completed' && enrollment.grade.score !== null && (
          <div className="mt-4 p-3 bg-accent/50 rounded-md">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Final Grade</span>
              <div className="text-right">
                <span className="text-lg font-bold">{enrollment.grade.score}%</span>
                {enrollment.grade.letter && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({enrollment.grade.letter})
                  </span>
                )}
              </div>
            </div>
            {enrollment.grade.passed && (
              <Badge variant="default" className="mt-2">
                Passed
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full">
          <Link to={`/learner/courses/${enrollment.target.id}/player`}>
            <PlayCircle className="h-4 w-4 mr-2" />
            {enrollment.status === 'completed' ? 'Review Course' : 'Continue Learning'}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
