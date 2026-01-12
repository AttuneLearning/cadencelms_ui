/**
 * CourseSegmentCard Component
 * Displays a course segment (module) as a card with order, title, and metadata
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
import { Clock, FileText, Hash } from 'lucide-react';
import type { CourseSegmentListItem } from '../model/types';
import { cn } from '@/shared/lib/utils';

interface CourseSegmentCardProps {
  segment: CourseSegmentListItem;
  courseId: string;
  className?: string;
  showOrder?: boolean;
  showType?: boolean;
}

export const CourseSegmentCard: React.FC<CourseSegmentCardProps> = ({
  segment,
  courseId,
  className,
  showOrder = true,
  showType = true,
}) => {
  return (
    <Link to={`/courses/${courseId}/modules/${segment.id}`} className="block">
      <Card className={cn('transition-shadow hover:shadow-md', className)}>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3 flex-1">
              {showOrder && (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm flex-shrink-0">
                  {segment.order}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <CardTitle className="line-clamp-2">{segment.title}</CardTitle>
                {segment.description && (
                  <CardDescription className="line-clamp-2 mt-1">
                    {segment.description}
                  </CardDescription>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end flex-shrink-0">
              {showType && (
                <Badge variant={getTypeVariant(segment.type)}>
                  {formatType(segment.type)}
                </Badge>
              )}
              {!segment.isPublished && (
                <Badge variant="outline">Draft</Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {segment.duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(segment.duration)}</span>
              </div>
            )}
            {segment.passingScore && (
              <div className="flex items-center gap-1">
                <Hash className="h-4 w-4" />
                <span>Pass: {segment.passingScore}%</span>
              </div>
            )}
            {segment.contentId && (
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>Has Content</span>
              </div>
            )}
            {segment.settings.allowMultipleAttempts && (
              <div className="flex items-center gap-1">
                <span>
                  {segment.settings.maxAttempts
                    ? `Max ${segment.settings.maxAttempts} attempts`
                    : 'Unlimited attempts'}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

// Helper functions
function getTypeVariant(
  type: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (type) {
    case 'scorm':
      return 'default';
    case 'exercise':
      return 'destructive';
    case 'video':
      return 'secondary';
    case 'document':
      return 'outline';
    default:
      return 'default';
  }
}

function formatType(type: string): string {
  const typeMap: Record<string, string> = {
    scorm: 'SCORM',
    custom: 'Custom',
    exercise: 'Exercise',
    video: 'Video',
    document: 'Document',
  };
  return typeMap[type] || type;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}
