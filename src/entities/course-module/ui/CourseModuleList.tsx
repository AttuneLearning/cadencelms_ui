/**
 * CourseModuleList Component
 * Displays a list of course segments with ordering support
 */

import React from 'react';
import { CourseModuleCard } from './CourseModuleCard';
import type { CourseModuleListItem } from '../model/types';
import { cn } from '@/shared/lib/utils';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { GripVertical } from 'lucide-react';

interface CourseModuleListProps {
  segments: CourseModuleListItem[];
  courseId: string;
  className?: string;
  showOrder?: boolean;
  showType?: boolean;
  enableReorder?: boolean;
  emptyMessage?: string;
}

export const CourseModuleList: React.FC<CourseModuleListProps> = ({
  segments,
  courseId,
  className,
  showOrder = true,
  showType = true,
  enableReorder = false,
  emptyMessage = 'No modules found',
}) => {
  if (!segments || segments.length === 0) {
    return (
      <Alert>
        <AlertDescription>{emptyMessage}</AlertDescription>
      </Alert>
    );
  }

  // Sort segments by order
  const sortedSegments = [...segments].sort((a, b) => a.order - b.order);

  return (
    <div className={cn('space-y-4', className)}>
      {enableReorder && (
        <Alert>
          <AlertDescription>
            Drag and drop to reorder modules. Changes will be saved automatically.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {sortedSegments.map((segment) => (
          <div
            key={segment.id}
            className={cn(
              'relative',
              enableReorder && 'group'
            )}
          >
            {enableReorder && (
              <div className="absolute left-0 top-0 bottom-0 flex items-center -ml-8 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <CourseModuleCard
              segment={segment}
              courseId={courseId}
              showOrder={showOrder}
              showType={showType}
            />
          </div>
        ))}
      </div>

      {enableReorder && (
        <div className="text-sm text-muted-foreground text-center pt-2">
          Showing {sortedSegments.length} module{sortedSegments.length !== 1 ? 's' : ''} in order
        </div>
      )}
    </div>
  );
};
