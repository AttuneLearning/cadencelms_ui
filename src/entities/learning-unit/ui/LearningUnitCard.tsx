/**
 * LearningUnitCard Component
 * Displays a learning unit as a card
 */

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import {
  Video,
  FileText,
  BookOpen,
  ClipboardCheck,
  Package,
  Clock,
  CheckCircle2,
  PlayCircle,
  Lock,
} from 'lucide-react';
import type { LearningUnitListItem, LearningUnitType, LearningUnitCategory } from '../model/types';
import { cn } from '@/shared/lib/utils';

interface LearningUnitCardProps {
  learningUnit: LearningUnitListItem;
  className?: string;
  onClick?: () => void;
  isCompleted?: boolean;
  isLocked?: boolean;
  progress?: number;
}

export const LearningUnitCard: React.FC<LearningUnitCardProps> = ({
  learningUnit,
  className,
  onClick,
  isCompleted = false,
  isLocked = false,
  progress,
}) => {
  const TypeIcon = getTypeIcon(learningUnit.type);
  const categoryColor = getCategoryColor(learningUnit.category);

  return (
    <Card
      className={cn(
        'transition-shadow',
        onClick && !isLocked && 'cursor-pointer hover:shadow-lg',
        isLocked && 'opacity-60',
        isCompleted && 'border-green-500/50',
        className
      )}
      onClick={!isLocked ? onClick : undefined}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={cn('rounded-md p-2', categoryColor)}>
              <TypeIcon className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {learningUnit.sequence}
                </Badge>
                {learningUnit.category && (
                  <Badge variant="secondary" className="text-xs">
                    {getCategoryLabel(learningUnit.category)}
                  </Badge>
                )}
                {!learningUnit.isActive && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    Inactive
                  </Badge>
                )}
              </div>
              <CardTitle className="line-clamp-1 text-base">{learningUnit.title}</CardTitle>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
            {isCompleted && <CheckCircle2 className="h-4 w-4 text-green-600" />}
            {!isCompleted && !isLocked && progress !== undefined && progress > 0 && (
              <PlayCircle className="h-4 w-4 text-blue-600" />
            )}
          </div>
        </div>
        {learningUnit.description && (
          <CardDescription className="line-clamp-2 text-xs">
            {learningUnit.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="pt-2">
        {/* Progress bar */}
        {progress !== undefined && progress > 0 && !isCompleted && (
          <div className="mb-2 space-y-1">
            <div className="h-1.5 w-full rounded-full bg-secondary">
              <div
                className="h-1.5 rounded-full bg-primary transition-all"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-xs">
            {getTypeLabel(learningUnit.type)}
          </Badge>
          {learningUnit.estimatedDuration && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{learningUnit.estimatedDuration}m</span>
            </div>
          )}
          {learningUnit.isRequired && (
            <Badge variant="secondary" className="text-xs">
              Required
            </Badge>
          )}
          {learningUnit.isReplayable && (
            <Badge variant="outline" className="text-xs">
              Replayable
            </Badge>
          )}
          {learningUnit.weight > 0 && (
            <span className="text-muted-foreground">
              Weight: {learningUnit.weight}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

function getTypeIcon(type: LearningUnitType): React.ComponentType<{ className?: string }> {
  switch (type) {
    case 'media':
      return Video;
    case 'document':
      return FileText;
    case 'exercise':
      return BookOpen;
    case 'assessment':
      return ClipboardCheck;
    case 'assignment':
      return ClipboardCheck;
    case 'scorm':
      return Package;
    case 'custom':
    default:
      return BookOpen;
  }
}

function getTypeLabel(type: LearningUnitType): string {
  switch (type) {
    case 'media':
      return 'Media';
    case 'document':
      return 'Document';
    case 'exercise':
      return 'Exercise';
    case 'assessment':
      return 'Assessment';
    case 'assignment':
      return 'Assignment';
    case 'scorm':
      return 'SCORM';
    case 'custom':
      return 'Custom';
    default:
      return type;
  }
}

function getCategoryLabel(category: LearningUnitCategory): string {
  switch (category) {
    case 'topic':
      return 'Topic';
    case 'practice':
      return 'Practice';
    case 'assignment':
      return 'Assignment';
    case 'graded':
      return 'Graded';
    default:
      return category;
  }
}

function getCategoryColor(category: LearningUnitCategory | null): string {
  if (!category) {
    return 'bg-gray-100 text-gray-700';
  }
  switch (category) {
    case 'topic':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
    case 'practice':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';
    case 'assignment':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
    case 'graded':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}
