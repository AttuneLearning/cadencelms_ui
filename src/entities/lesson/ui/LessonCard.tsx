/**
 * LessonCard Component
 * Displays a lesson as a card with title, type, and progress
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
import { Progress } from '@/shared/ui/progress';
import {
  PlayCircle,
  FileText,
  BookOpen,
  CheckCircle,
  Lock,
  Clock,
  HelpCircle,
  ClipboardList,
} from 'lucide-react';
import type { LessonListItem } from '../model/types';
import { cn } from '@/shared/lib/utils';

interface LessonCardProps {
  lesson: LessonListItem;
  courseId: string;
  className?: string;
  showProgress?: boolean;
  onClick?: (lesson: LessonListItem) => void;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  courseId,
  className,
  showProgress = false,
  onClick,
}) => {
  const content = (
    <>
      <Card
        className={cn(
          'transition-shadow hover:shadow-md',
          lesson.isLocked && 'opacity-60',
          className
        )}
      >
        <CardHeader>
          <div className="flex items-start gap-3">
            {/* Lesson Type Icon */}
            <div className="mt-1 flex-shrink-0">{getLessonIcon(lesson.type, lesson.isLocked)}</div>

            <div className="flex-1 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">
                  <span className="mr-2 text-sm text-muted-foreground">
                    {String(lesson.order).padStart(2, '0')}.
                  </span>
                  {lesson.title}
                </CardTitle>

                {/* Status Badge */}
                {lesson.isCompleted && !lesson.isLocked && (
                  <Badge variant="secondary" className="flex-shrink-0">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Completed
                  </Badge>
                )}
                {lesson.isLocked && (
                  <Badge variant="outline" className="flex-shrink-0">
                    <Lock className="mr-1 h-3 w-3" />
                    Locked
                  </Badge>
                )}
              </div>

              <CardDescription className="flex flex-wrap items-center gap-3 text-sm">
                {/* Lesson Type Badge */}
                <Badge variant="outline">{getLessonTypeLabel(lesson.type)}</Badge>

                {/* Duration */}
                {typeof lesson.duration === 'number' && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDuration(lesson.duration)}
                  </span>
                )}

                {/* Required Badge */}
                {lesson.isRequired && (
                  <Badge variant="destructive" className="text-xs">
                    Required
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        {/* Progress Bar */}
        {showProgress && typeof lesson.progress === 'number' && lesson.progress > 0 && (
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{lesson.progress}%</span>
              </div>
              <Progress value={lesson.progress} className="h-2" />
            </div>
          </CardContent>
        )}
      </Card>
    </>
  );

  if (onClick) {
    return (
      <div onClick={() => onClick(lesson)} className={cn('block cursor-pointer')}>
        {content}
      </div>
    );
  }

  return (
    <Link to={`/courses/${courseId}/lessons/${lesson._id}`} className="block">
      {content}
    </Link>
  );
};

// Helper functions
function getLessonIcon(type: string, isLocked?: boolean) {
  if (isLocked) {
    return <Lock className="h-5 w-5 text-muted-foreground" />;
  }

  switch (type) {
    case 'video':
      return <PlayCircle className="h-5 w-5 text-blue-500" />;
    case 'document':
      return <FileText className="h-5 w-5 text-green-500" />;
    case 'scorm':
      return <BookOpen className="h-5 w-5 text-purple-500" />;
    case 'quiz':
      return <HelpCircle className="h-5 w-5 text-orange-500" />;
    case 'assignment':
      return <ClipboardList className="h-5 w-5 text-red-500" />;
    default:
      return <FileText className="h-5 w-5 text-muted-foreground" />;
  }
}

function getLessonTypeLabel(type: string): string {
  switch (type) {
    case 'video':
      return 'Video';
    case 'document':
      return 'Document';
    case 'scorm':
      return 'SCORM Package';
    case 'quiz':
      return 'Quiz';
    case 'assignment':
      return 'Assignment';
    default:
      return type;
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
