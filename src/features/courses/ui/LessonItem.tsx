/**
 * LessonItem Component
 * Displays a single lesson/content item with drag-and-drop support
 */

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Package,
  FileVideo,
  HelpCircle,
  FileText,
  PlayCircle,
  MoreVertical,
  Clock,
  Eye,
  Trash2,
  Settings,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import type { LessonListItem } from '@/entities/course-segment/model/lessonTypes';

interface LessonItemProps {
  lesson: LessonListItem;
  onEdit: (lesson: LessonListItem) => void;
  onRemove: (lessonId: string) => void;
  onPreview?: (lesson: LessonListItem) => void;
}

const contentTypeConfig: Record<
  string,
  { icon: LucideIcon; className: string; label: string }
> = {
  scorm: {
    icon: Package,
    className: 'bg-purple-500/10 text-purple-500',
    label: 'SCORM',
  },
  media: {
    icon: FileVideo,
    className: 'bg-blue-500/10 text-blue-500',
    label: 'Media',
  },
  video: {
    icon: PlayCircle,
    className: 'bg-blue-500/10 text-blue-500',
    label: 'Video',
  },
  exercise: {
    icon: HelpCircle,
    className: 'bg-orange-500/10 text-orange-500',
    label: 'Exercise',
  },
  document: {
    icon: FileText,
    className: 'bg-green-500/10 text-green-500',
    label: 'Document',
  },
  custom: {
    icon: FileText,
    className: 'bg-gray-500/10 text-gray-500',
    label: 'Custom',
  },
};

function getContentTypeConfig(type: string) {
  return contentTypeConfig[type] || contentTypeConfig.custom;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '--';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function getCompletionCriteriaLabel(
  criteria: LessonListItem['settings']['completionCriteria']
): string {
  switch (criteria.type) {
    case 'view_time':
      return `View ${criteria.requiredPercentage || 100}%`;
    case 'quiz_score':
      return `Score ${criteria.minimumScore || 70}%+`;
    case 'manual':
      return 'Manual';
    case 'auto':
      return 'Auto-complete';
    default:
      return 'None';
  }
}

export const LessonItem: React.FC<LessonItemProps> = ({
  lesson,
  onEdit,
  onRemove,
  onPreview,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lesson.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const typeConfig = getContentTypeConfig(lesson.type);
  const TypeIcon = typeConfig.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group flex items-center gap-3 rounded-lg border bg-card p-4
        transition-all hover:border-primary/50 hover:shadow-sm
        ${isDragging ? 'opacity-50 shadow-lg' : ''}
      `}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Content Type Icon */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${typeConfig.className}`}
      >
        <TypeIcon className="h-5 w-5" />
      </div>

      {/* Lesson Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="truncate font-medium">{lesson.title}</h4>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatDuration(lesson.duration)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {getCompletionCriteriaLabel(lesson.settings.completionCriteria)}
              </span>
            </div>
          </div>

          {/* Badges */}
          <div className="flex shrink-0 items-center gap-2">
            {lesson.settings.isRequired && (
              <Badge variant="default" className="bg-red-500/10 text-red-600">
                Required
              </Badge>
            )}
            {!lesson.settings.isRequired && (
              <Badge variant="secondary">Optional</Badge>
            )}
            {!lesson.isPublished && (
              <Badge variant="outline">Draft</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Actions Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">More options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(lesson)}>
            <Settings className="mr-2 h-4 w-4" />
            Edit Settings
          </DropdownMenuItem>
          {onPreview && (
            <DropdownMenuItem onClick={() => onPreview(lesson)}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onRemove(lesson.id)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
