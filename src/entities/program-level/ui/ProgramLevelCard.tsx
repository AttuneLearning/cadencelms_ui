/**
 * Program Level Card Component
 * Displays program level information in a card layout
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Layers, BookOpen, Award, Calendar } from 'lucide-react';
import type { ProgramLevel, ProgramLevelListItem } from '../model/types';

interface ProgramLevelCardProps {
  level: ProgramLevel | ProgramLevelListItem;
  showProgram?: boolean;
  showDetails?: boolean;
  onClick?: () => void;
}

export function ProgramLevelCard({
  level,
  showProgram = true,
  showDetails = true,
  onClick,
}: ProgramLevelCardProps) {
  const isClickable = !!onClick;
  const courseCount = 'courses' in level ? level.courses.length : 'courseCount' in level ? level.courseCount : 0;
  const hasProgram = 'program' in level && level.program;

  return (
    <Card
      className={isClickable ? 'cursor-pointer transition-colors hover:bg-accent' : ''}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 flex-wrap">
              <Layers className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">{level.name}</span>
              <Badge variant="outline" className="flex-shrink-0">
                Order {level.order}
              </Badge>
            </CardTitle>
            {level.description && (
              <CardDescription className="mt-2 line-clamp-2">
                {level.description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      {showDetails && (
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">{courseCount}</div>
                <div className="text-xs text-muted-foreground">Courses</div>
              </div>
            </div>

            {level.requiredCredits !== null && (
              <div className="flex items-center gap-2 text-sm">
                <Award className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{level.requiredCredits}</div>
                  <div className="text-xs text-muted-foreground">Required Credits</div>
                </div>
              </div>
            )}
          </div>

          {showProgram && hasProgram && (
            <div className="mt-4 pt-4 border-t text-sm">
              <div className="text-muted-foreground mb-1">Program</div>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <span className="font-medium">{level.program.name}</span>
                <Badge variant="outline" className="text-xs">
                  {level.program.code}
                </Badge>
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Created {new Date(level.createdAt).toLocaleDateString()}</span>
            {level.updatedAt !== level.createdAt && (
              <>
                <span className="text-muted-foreground/50">•</span>
                <span>Updated {new Date(level.updatedAt).toLocaleDateString()}</span>
              </>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
