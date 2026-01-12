/**
 * Course Navigation Component
 * Sidebar showing modules and lessons with progress indicators
 * Used in course preview to simulate learner navigation
 */

import { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Lock,
  PlayCircle,
  FileText,
  Package,
  Video,
  ClipboardList,
} from 'lucide-react';
import type { CourseSegment, CourseSegmentListItem } from '@/entities/course-segment/model/types';

interface CourseNavigationProps {
  modules: (CourseSegment | CourseSegmentListItem)[];
  currentModuleId?: string;
  onModuleClick: (moduleId: string) => void;
  className?: string;
  simulatedProgress?: {
    [moduleId: string]: {
      isCompleted: boolean;
      isLocked: boolean;
      progress?: number;
    };
  };
}

export function CourseNavigation({
  modules,
  currentModuleId,
  onModuleClick,
  className,
  simulatedProgress = {},
}: CourseNavigationProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(modules.map((m) => m.id))
  );

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'scorm':
        return <Package className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'exercise':
        return <ClipboardList className="h-4 w-4" />;
      default:
        return <PlayCircle className="h-4 w-4" />;
    }
  };

  const getModuleStatus = (moduleId: string) => {
    const progress = simulatedProgress[moduleId];
    if (!progress) return { icon: Circle, color: 'text-muted-foreground' };

    if (progress.isLocked) {
      return { icon: Lock, color: 'text-muted-foreground' };
    }

    if (progress.isCompleted) {
      return { icon: CheckCircle2, color: 'text-green-500' };
    }

    return { icon: Circle, color: 'text-blue-500' };
  };

  const calculateOverallProgress = () => {
    if (modules.length === 0) return 0;
    const completedModules = modules.filter(
      (m) => simulatedProgress[m.id]?.isCompleted
    ).length;
    return (completedModules / modules.length) * 100;
  };

  const sortedModules = [...modules].sort((a, b) => a.order - b.order);

  return (
    <Card className={cn('flex flex-col h-full', className)}>
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-2">Course Content</h2>
        <div className="space-y-2">
          <Progress value={calculateOverallProgress()} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {modules.filter((m) => simulatedProgress[m.id]?.isCompleted).length} of{' '}
            {modules.length} modules completed
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {sortedModules.map((module, index) => {
            const isExpanded = expandedModules.has(module.id);
            const isCurrent = module.id === currentModuleId;
            const progress = simulatedProgress[module.id];
            const statusInfo = getModuleStatus(module.id);
            const StatusIcon = statusInfo.icon;
            const isLocked = progress?.isLocked ?? false;

            return (
              <div key={module.id} className="space-y-1">
                <div
                  className={cn(
                    'group flex items-center gap-2 rounded-lg p-3 transition-colors',
                    isCurrent
                      ? 'bg-primary/10 text-primary'
                      : isLocked
                      ? 'opacity-60 cursor-not-allowed'
                      : 'hover:bg-accent cursor-pointer'
                  )}
                  onClick={() => {
                    if (!isLocked) {
                      onModuleClick(module.id);
                    }
                  }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleModule(module.id);
                    }}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>

                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <StatusIcon className={cn('h-4 w-4 flex-shrink-0', statusInfo.color)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Module {index + 1}
                        </span>
                        {!module.isPublished && (
                          <Badge variant="outline" className="text-xs">
                            Draft
                          </Badge>
                        )}
                      </div>
                      <p
                        className={cn(
                          'text-sm font-medium truncate',
                          isCurrent && 'font-semibold'
                        )}
                      >
                        {module.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getModuleIcon(module.type)}
                      {module.duration && (
                        <span className="text-xs text-muted-foreground">
                          {module.duration}m
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && module.description && (
                  <div className="ml-11 mr-3 mb-2">
                    <p className="text-xs text-muted-foreground">{module.description}</p>
                    {progress?.progress !== undefined && progress.progress > 0 && (
                      <div className="mt-2">
                        <Progress value={progress.progress} className="h-1" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {modules.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-sm text-muted-foreground">No modules in this course yet</p>
          </div>
        )}
      </div>
    </Card>
  );
}
