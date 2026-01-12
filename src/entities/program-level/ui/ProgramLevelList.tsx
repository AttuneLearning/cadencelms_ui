/**
 * Program Level List Component
 * Displays a list of program levels with optional reordering support
 */

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { ArrowUp, ArrowDown, GripVertical, Layers, BookOpen } from 'lucide-react';
import type { ProgramLevelListItem } from '../model/types';
import { cn } from '@/shared/lib/utils';

interface ProgramLevelListProps {
  levels: ProgramLevelListItem[];
  enableReorder?: boolean;
  onReorder?: (levelId: string, newOrder: number) => void;
  onLevelClick?: (levelId: string) => void;
  loading?: boolean;
}

export function ProgramLevelList({
  levels,
  enableReorder = false,
  onReorder,
  onLevelClick,
  loading = false,
}: ProgramLevelListProps) {
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  // Sort levels by order
  const sortedLevels = [...levels].sort((a, b) => a.order - b.order);

  const handleMoveUp = (levelId: string, currentOrder: number) => {
    if (currentOrder > 1 && onReorder) {
      setReorderingId(levelId);
      onReorder(levelId, currentOrder - 1);
      setTimeout(() => setReorderingId(null), 500);
    }
  };

  const handleMoveDown = (levelId: string, currentOrder: number) => {
    if (currentOrder < sortedLevels.length && onReorder) {
      setReorderingId(levelId);
      onReorder(levelId, currentOrder + 1);
      setTimeout(() => setReorderingId(null), 500);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-muted animate-pulse rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
                <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (sortedLevels.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Levels Found</h3>
        <p className="text-sm text-muted-foreground">
          This program doesn't have any levels yet.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {sortedLevels.map((level, index) => {
        const isReordering = reorderingId === level.id;
        const isFirst = index === 0;
        const isLast = index === sortedLevels.length - 1;

        return (
          <Card
            key={level.id}
            className={cn(
              'transition-all duration-300',
              isReordering && 'bg-accent',
              onLevelClick && 'cursor-pointer hover:bg-accent/50'
            )}
            onClick={() => !enableReorder && onLevelClick?.(level.id)}
          >
            <div className="p-4 flex items-center gap-4">
              {enableReorder && (
                <div className="flex items-center gap-2">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      disabled={isFirst || isReordering}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveUp(level.id, level.order);
                      }}
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      disabled={isLast || isReordering}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveDown(level.id, level.order);
                      }}
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center min-w-[3rem]">
                <Badge variant="outline" className="font-mono">
                  {level.order}
                </Badge>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <h3 className="font-semibold truncate">{level.name}</h3>
                </div>
                {level.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {level.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{level.courseCount || 0}</div>
                    <div className="text-xs text-muted-foreground">Courses</div>
                  </div>
                </div>

                {level.requiredCredits !== null && (
                  <div className="text-center">
                    <div className="font-medium">{level.requiredCredits}</div>
                    <div className="text-xs text-muted-foreground">Credits</div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
