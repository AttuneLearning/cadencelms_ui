/**
 * ModuleCard Component
 * Displays a module as a card with metadata
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
import { BookOpen, Clock, Target, Lock, CheckCircle2 } from 'lucide-react';
import type { ModuleListItem } from '../model/types';
import { cn } from '@/shared/lib/utils';

interface ModuleCardProps {
  module: ModuleListItem;
  className?: string;
  onClick?: () => void;
  isLocked?: boolean;
  isCompleted?: boolean;
  progress?: number;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  className,
  onClick,
  isLocked = false,
  isCompleted = false,
  progress,
}) => {
  const presentationModeLabel = getPresentationModeLabel(module.presentationRules.presentationMode);
  const completionLabel = getCompletionLabel(module.completionCriteria.type);

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
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Module {module.order}
              </Badge>
              {!module.isPublished && (
                <Badge variant="secondary">Draft</Badge>
              )}
              {isLocked && (
                <Badge variant="outline" className="text-xs">
                  <Lock className="mr-1 h-3 w-3" />
                  Locked
                </Badge>
              )}
              {isCompleted && (
                <Badge variant="default" className="bg-green-600 text-xs">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Completed
                </Badge>
              )}
            </div>
            <CardTitle className="line-clamp-2">{module.title}</CardTitle>
          </div>
        </div>
        {module.description && (
          <CardDescription className="line-clamp-2">{module.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Progress bar */}
        {progress !== undefined && progress > 0 && !isCompleted && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress * 100)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {module.learningUnitCount !== null && (
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{module.learningUnitCount} Units</span>
            </div>
          )}
          {module.estimatedDuration > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(module.estimatedDuration)}</span>
            </div>
          )}
        </div>

        {/* Objectives */}
        {module.objectives.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Target className="h-3 w-3" />
              Objectives
            </div>
            <ul className="text-xs text-muted-foreground">
              {module.objectives.slice(0, 2).map((obj, idx) => (
                <li key={idx} className="line-clamp-1">• {obj}</li>
              ))}
              {module.objectives.length > 2 && (
                <li className="text-muted-foreground/70">
                  +{module.objectives.length - 2} more
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Settings badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            {presentationModeLabel}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {completionLabel}
          </Badge>
          {module.presentationRules.allowSkip && (
            <Badge variant="secondary" className="text-xs">
              Skippable
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

function getPresentationModeLabel(mode: string): string {
  switch (mode) {
    case 'prescribed':
      return 'Fixed Order';
    case 'learner_choice':
      return 'Choose Order';
    case 'random':
      return 'Random Order';
    default:
      return mode;
  }
}

function getCompletionLabel(type: string): string {
  switch (type) {
    case 'all_required':
      return 'Complete All';
    case 'percentage':
      return 'Percentage Based';
    case 'gate_learning_unit':
      return 'Gate Assessment';
    case 'points':
      return 'Points Based';
    default:
      return type;
  }
}

function formatDuration(minutes: number): string {
  if (minutes === 0) return 'No duration';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
