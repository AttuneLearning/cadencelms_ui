/**
 * PlayerSidebar Component
 * Course navigation sidebar for player
 */

import { Check, Lock, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Progress } from '@/shared/ui/progress';
import { cn } from '@/shared/lib/utils';
import { useState } from 'react';

export interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
  isExpanded?: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  type: 'scorm' | 'video' | 'document' | 'exercise';
  isCompleted: boolean;
  isLocked: boolean;
  isCurrent: boolean;
}

export interface PlayerSidebarProps {
  courseTitle: string;
  modules: CourseModule[];
  overallProgress: number;
  onLessonClick: (moduleId: string, lessonId: string) => void;
}

export function PlayerSidebar({
  courseTitle,
  modules,
  overallProgress,
  onLessonClick,
}: PlayerSidebarProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(modules.map((m) => m.id))
  );

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const getLessonIcon = (lesson: Lesson) => {
    if (lesson.isLocked) {
      return <Lock className="h-4 w-4 text-muted-foreground" />;
    }
    if (lesson.isCompleted) {
      return <Check className="h-4 w-4 text-green-600" />;
    }
    return null;
  };

  return (
    <div className="flex h-full flex-col border-r bg-background">
      {/* Header */}
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold line-clamp-2">{courseTitle}</h2>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      </div>

      {/* Module List */}
      <div className="flex-1 overflow-y-auto">
        {modules.map((module) => {
          const isExpanded = expandedModules.has(module.id);

          return (
            <div key={module.id} className="border-b last:border-0">
              {/* Module Header */}
              <Button
                variant="ghost"
                className="w-full justify-start p-4 font-semibold hover:bg-muted/50"
                onClick={() => toggleModule(module.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="mr-2 h-4 w-4" />
                ) : (
                  <ChevronRight className="mr-2 h-4 w-4" />
                )}
                <span className="flex-1 text-left">{module.title}</span>
              </Button>

              {/* Lessons */}
              {isExpanded && (
                <div className="py-1">
                  {module.lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => !lesson.isLocked && onLessonClick(module.id, lesson.id)}
                      disabled={lesson.isLocked}
                      className={cn(
                        'flex w-full items-center gap-3 px-6 py-2.5 text-left text-sm transition-colors',
                        lesson.isCurrent && 'bg-primary/10 text-primary font-medium',
                        !lesson.isCurrent && !lesson.isLocked && 'hover:bg-muted/50',
                        lesson.isLocked && 'cursor-not-allowed opacity-50'
                      )}
                    >
                      {getLessonIcon(lesson)}
                      <span className="flex-1">{lesson.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
